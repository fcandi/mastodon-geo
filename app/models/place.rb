# == Schema Information
#
# Table name: places
#
#  id         :bigint(8)        not null, primary key
#  placetype  :string
#  placename  :string
#  geodata    :jsonb
#  lat        :decimal(10, 6)
#  lng        :decimal(10, 6)
#  display    :integer
#  account_id :bigint(8)
#  status_id  :bigint(8)
#  created_at :datetime         not null
#  updated_at :datetime         not null

require 'http'

class Place < ApplicationRecord
  belongs_to :account, optional: true
  belongs_to :status, dependent: :destroy, optional: true
  after_create :create_bot_post

  Ignore_values = ["Metropolitan France"]
  Use_tags = %w(country state region island subregion municipality city locality place)

  def get_geo_data
    begin
      url = ENV['GEO_GEOCODER'] +
        lng.to_s + ',' + lat.to_s +
        ENV['GEO_GEOCODER_KEY']
      res = JSON.parse(HTTP.get(url))
      calc = Hash.new
      feature = Hash.new
      res['features'].each do |r|
        keyval = r['place_type'].first.to_s
        calc[keyval] = r['text'] unless Ignore_values.include? r['text']
      end
      return_tags = ""
      first=true
      Use_tags.each do |val|
        currentval = calc[val].gsub(/[-.,#()?!'`+& ]/, '') if calc[val]
        if  currentval
          return_tags+= " " unless first
          first = false
          return_tags += "#" + currentval
        end
      end
      p return_tags
    rescue => e
      puts "PROBLEMS WITH API:  " + e.to_s
      #raise e
      return ""
    end
    return_tags
  end

  def create_bot_post
    bot_status = Status.new
    bot_status.visibility = 0
    bot_status.language = 'en'
    bot_status.local = true
    bot_status.account_id = ENV['GEO_BOT_ACCOUNT']
    bot_status.text = '#newplace #' + self.placetype + ' by @' + self.account.username + "\r\n" +
      ENV['GEO_INTERNAL_LINK'] + '/p/' + self.id.to_s + "\r\n\r\n" + get_geo_data
    bot_status.save
    service = ProcessHashtagsService.new
    service.call(bot_status)
    self.status = bot_status
    save
    add_mention
  end

  def add_mention
    unless self.status.mentions.joins(:account).merge(Account.local).active.pluck(:account_id).include? self.account_id
      m = Mention.new
      m.status = status
      m.account = account
      m.save
    end
  end

  def coordinates
    [lng.to_f,lat.to_f]
  end

end

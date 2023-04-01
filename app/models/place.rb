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
  has_many :place_favs, dependent: :destroy
  has_many :place_visits, dependent: :destroy


  Ignore_values = ["Metropolitan France"]
  Use_tags = %w(country state region island subregion municipality city locality place)
  Place_tags = {
    'free' => '#freeSite',
    'paid' => '#paidSite',
    'wild' =>  '#wildSite',
    'camp' =>  "#campsite"
  }

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
    add_visit! account

    bot_status = Status.new
    bot_status.visibility = 0
    bot_status.language = 'en'
    bot_status.local = true
    bot_status.account_id = ENV['GEO_BOT_ACCOUNT']
    bot_status.text = ':geo_' + placetype + ': ' + placename + " by @" + account.username + "\r\n\r\n:geo_map: " +
      ENV['GEO_INTERNAL_LINK'] + '/p/' + id.to_s + "\r\n#newPlace " + Place_tags[placetype] + " " + get_geo_data
    #bot_status.media_attachments = [f]
    bot_status.created_at = created_at if created_at
    bot_status.save
    service = ProcessHashtagsService.new
    service.call(bot_status)
    Trends.tags.register(bot_status) unless created_at
    self.status = bot_status
    save
    add_mention
  end

  def add_mention
    unless status.mentions.joins(:account).merge(Account.local).active.pluck(:account_id).include? account_id
      m = Mention.new
      m.status = status
      m.account = account
      m.save
    end
  end

  def coordinates
    [lng.to_f,lat.to_f]
  end

  def has_second_post?
    place_visits.count>1
  end

  def update_right? user
    return false if !user
    #return true if  user.role.name = "Admin"
    return true if user.account == account && !has_second_post?
  end

  def add_fav! account
    place_favs.new({ account: account} ).save!
  end

  def remove_fav! account
    place_favs.where(account: account).delete_all
  end

  def add_visit! account
    return true if place_visits.where( {account: account} ).count>0
    begin
      place_visits.new({ account: account} ).save!
    rescue => e
      p e
    end
  end

  def remove_visit! account
    place_visits.where(account: account).delete_all
  end

  def visit? user
    place_visits.where(account: user&.account).count>0
  end

  def fav? user
     place_favs.where(account: user&.account).count>0
  end

end

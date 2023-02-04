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
#
class Place < ApplicationRecord
  belongs_to :account, optional: true
  belongs_to :status, dependent: :destroy, optional: true
  after_create :create_bot_post

  def create_bot_post
    bot_status = Status.new
    bot_status.visibility = 1
    bot_status.language = 'en'
    bot_status.local = true
    bot_status.account_id = ENV['GEO_BOT_ACCOUNT']
    bot_status.text = '#newplace #' + self.placetype + ' by @' + self.account.username + "\r\n" +
      ENV['GEO_INTERNAL_LINK'] + '/p/' + self.id.to_s
    bot_status.save
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

# == Schema Information
#
# Table name: geo_users
#
#  id         :bigint(8)        not null, primary key
#  account_id :bigint(8)        not null
#  status     :integer
#  userdata   :jsonb
#  created_at :datetime         not null
#  updated_at :datetime         not null
# ,{token: userdata['token']}
class GeoUser < ApplicationRecord
  belongs_to :account

  def check_token!
    return false unless userdata['token']
    url = ENV.fetch('GEO_OLD_GEOBLA_HOST', nil) + '/api/emails_c/' + userdata['token'] + '?t=' + DateTime.now.to_s
    begin
      resraw = HTTP.get(url)
      res = JSON.parse(resraw) if resraw
    rescue => e
      puts 'PROBLEMS WITH GEOBLA:  ' + e.to_s
      false
    end
    res
  end
end

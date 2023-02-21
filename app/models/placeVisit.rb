# == Schema Information
#
# Table name: place_visits
#
#  id         :bigint(8)        not null, primary key
#  rating     :integer
#  account_id :bigint(8)        not null
#  place_id   :bigint(8)        not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
class PlaceVisit < ApplicationRecord
  belongs_to :account
  belongs_to :place
end

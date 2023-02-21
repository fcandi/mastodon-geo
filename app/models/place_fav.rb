# == Schema Information
#
# Table name: place_favs
#
#  id         :bigint(8)        not null, primary key
#  account_id :bigint(8)        not null
#  place_id   :bigint(8)        not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
class PlaceFav < ApplicationRecord
  belongs_to :account
  belongs_to :place
end

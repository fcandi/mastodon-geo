class REST::PlaceSerializer < ActiveModel::Serializer
  attributes :id, :placetype, :placename, :geodata, :lat, :lng, :display, :status_id, :account_id
  #has_one :account


  attribute :fav, if: :current_user?
  attribute :visit, if: :current_user?

  def id
    object.id.to_s
  end

  def status_id
    object.status_id.to_s
  end

  def account_id
    object.account_id.to_s
  end

  def fav
    object.fav? current_user
  end

  def visit
    object.visit? current_user
  end

  def current_user?
    !current_user.nil?
  end

end

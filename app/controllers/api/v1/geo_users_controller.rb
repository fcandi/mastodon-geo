class Api::V1::GeoUsersController < Api::BaseController
  include Authorization

  before_action :require_user!
  before_action :set_geo_user, except: [:create, :geobla_move]

  # POST
  def create
    #@geo_user = GeoUser.new(geo_user_params)
    #@geo_user.account = current_user&.account
    #if @geo_user.save!
    #  render json:  @geo_user, serializer: REST::PlaceSerializer
    #else
    #  unprocessable_entity
    #end
  end

  # PATCH/PUT
  def update
    #if @geo_user.update(place_params)
    #  render json:  @geo_user, serializer: REST::PlaceSerializer
    #else
    #  unprocessable_entity
    #end
  end

  def geobla_move
    return unprocessable_entity if GeoUser.where(account_id: current_user&.account_id).count>0
    @geo_user = GeoUser.new(geo_user_params)
    @geo_user.account_id = current_user&.account_id
    p '----------------------------------------------'
    p @geo_user
    if @geo_user.check_token!
      p "GESCHAFFRT"
      render json: @geo_user
    else
      unprocessable_entity
    end
  end

  # DELETE
  def destroy
    #@geoUser.destroy
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_geo_user
    @geo_user = GeoUser.where(account_id: current_user&.account_id)
  end

  # Only allow a list of trusted parameters through.
  def geo_user_params
    params.require(:geoUser).permit(:account_id, userdata: {})
  end

  def geo_json
    {
      type: "FeatureCollection",
      features: features
    }
  end

end

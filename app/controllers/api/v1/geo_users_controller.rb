require 'http'

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
    if @geo_user = GeoUser.where(account_id: current_user&.account_id).first
      p "============================================================SCHON DA"
      ret = { success: false }
    else
      @geo_user = GeoUser.new(geo_user_params) unless @geo_user
      return unprocessable_entity if !res = @geo_user.check_token!
      return unprocessable_entity if !res['success']
      @geo_user.account_id = current_user&.account_id
      @geo_user.status = 0
      @geo_user.userdata = {
        lang: res['lang'],
        user_id: res['user_id']
      }
      return unprocessable_entity unless  @geo_user.save!
      ret = { success: true }
    end
    render json: ret
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

  def geo_json2
    {
      type: "FeatureCollection",
      features: features
    }
  end

end

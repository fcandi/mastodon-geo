require 'oj'

class Api::V1::PlacesController < Api::BaseController

  include Authorization
  before_action :require_user!, except:  [:show, :json_all, :json_user, :json_user2, :json_likes]
  before_action :set_place, except: [ :json_all, :index, :create, :json_user, :json_user2, :json_likes]
  before_action :create_right, only: [:new]
  before_action :update_right, only: [:new, :update, :destroy]


  # GET /places
  def index
    @places = Place.all
    render json: @places, each_serializer: REST::PlaceSerializer
  end

  def json_all
    @places = Place.all.limit(10)
    render json: Oj.dump(geo_json,{:mode => :strict }), status: :ok
  end

  def json_user
    @places = Place.joins(:place_visits).where(place_visits: { account_id:  params['account_id']})
    render json: Oj.dump(geo_json,{:mode => :strict }), status: :ok
  end

  def json_user2
    @places = Place.joins(:place_visits).where(place_visits: { account_id:  params['account_id']})
    render json: Oj.dump(geo_json2,{:mode => :strict }), status: :ok
  end

  def json_likes
    @places = Place.joins(:place_favs).where(place_favs: { account_id:  params['account_id']})
    render json: Oj.dump(geo_json,{:mode => :strict }), status: :ok
  end

  # GET /places/1
  def show
    render json:  @place, serializer: REST::PlaceSerializer
  end

  # GET /places/new
  def new
    @place = Place.new
    p 'test'
    p @place
    render json:  @place, serializer: REST::PlaceSerializer
  end

  # GET /places/1/edit
  def edit
    render json:  @place, serializer: REST::PlaceSerializer
  end

  # POST /places
  def create
    @place = Place.new(place_params)
    @place.account = current_user&.account
    p ENV['GEO_BOT_ACCOUNT']
    if @place.save!
      render json:  @place, serializer: REST::PlaceSerializer
    else
      unprocessable_entity
    end
  end

  # PATCH/PUT /places/1
  def update
    if @place.update(place_params)
      render json:  @place, serializer: REST::PlaceSerializer
    else
      unprocessable_entity
    end
  end

  # DELETE /places/1
  def destroy
    @place.destroy
    #redirect_to places_url, notice: 'Place was successfully destroyed.'
  end

  def add_fav
    @place.add_fav! current_user&.account
  end

  def remove_fav
    @place.remove_fav! current_user&.account
  end

  def add_visit
    @place.add_visit! current_user&.account
  end

  def remove_visit
    @place.remove_visit! current_user&.account
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_place
      @place = Place.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def place_params
      params.require(:place).permit(:placetype, :placename, :geodata, :lat, :lng, :status_id, :account_id, :display)
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
      features: features2
    }
  end

  def features
    @places.map do |u|
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [ u.lng, u.lat]
        },
        properties: {
          id: u.id,
          placename: u.placename,
          placetype: u.placetype
        }
      }
    end
  end

  def features2
    @places.map do |u|
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [ u.lng, u.lat]
        },
        properties: {
          name: u.placename,
          'osmand:color': u.osmand_color,
          'osmand:icon': u.osmand_icon,
          'osmand:background': 'circle'
        }
      }
    end
  end

  private

  def create_right
    @account=current_user&.account
    raise(ActiveRecord::RecordNotFound) if !@account.local? || @account.suspended? || @account.user_pending?
  end

  def update_right
    raise(ActiveRecord::RecordNotFound) if !@place.update_right? current_user
  end
end

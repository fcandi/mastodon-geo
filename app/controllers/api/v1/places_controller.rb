require 'oj'

class Api::V1::PlacesController < Api::BaseController

  include Authorization

  #before_action -> { authorize_if_got_token! :read }, except: [:create, :update, :destroy]
  #before_action -> { doorkeeper_authorize! :write  }, only:   [:create, :update, :destroy]
  before_action :require_user!, except:  [:show, :context, :json_all]
  before_action :set_place, only: [:show, :edit, :update, :destroy]

  # GET /places
  def index
    @places = Place.all
    render json: @places, each_serializer: REST::PlaceSerializer
  end

  def json_all
    @places = Place.all
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
      redirect_to @place, notice: 'Place was successfully updated.'
    else
      render :edit
    end
  end

  # DELETE /places/1
  def destroy
    @place.destroy
    #redirect_to places_url, notice: 'Place was successfully destroyed.'
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
end

namespace :geo do

  desc "mein Test"
  task test: :environment do
    user = User.first
    json = JSON.parse(File.read("./tmp/activities.json"))
    p json['data'].count
    json['data'][0..5].each do |post|
      next unless post['type']=='activity'
      # check double entries status
      next if Status.where(account: user.account, created_at: DateTime.parse(post['attributes']['time_at'])).count>0
      # find place, if nio place skip
      next unless place_data = json['included'].find {|el|  el['type']=='place' && el['id'].to_s == post['attributes']['place_id'].to_s}
      #p place_data
      place = create_place(place_data, user.account)

      status = Status.new
      status.visibility = 0
      status.language = 'en'
      status.local = true
      status.account = user.account
      if post['attributes']['content']
        status.text = post['attributes']['content']['body']&.truncate(500)
      else
        status.text = ''
      end
      status.created_at = DateTime.parse(post['attributes']['time_at'])
      status.conversation_id = place.status.conversation_id
      status.in_reply_to_id = place.status.id
      media_ids = []
      post["attributes"]["image_urls"][0..3].each do |photo|
        media_id = create_attachment(user,photo["srcSet"][photo["srcSet"].count-1].split.first)
        media_ids.push(media_id)
        puts media_ids
      end

      status.media_attachments = media_ids
      status.save

      ## manually call services
      service = ProcessHashtagsService.new
      service.call(status)
    end
  end

  def create_attachment(user,media_url)
    tmp_file_name = './tmp/' + File.basename(media_url)
    begin
        tempfile = open(tmp_file_name, 'wb') do |file|
          file << URI.open(media_url).read
        end
        attachment = user.account.media_attachments.create!(file: File.new(tempfile))
        attachment_id = attachment["id"]
        File.delete(tempfile)
        rescue
          attachment_id = nil
      end
      return attachment
  end

  def find_place (data,id)

  end

  def create_place ( place_data, account )
    place = Place.where("geodata->>'place_id' = '" + place_data['id'].to_s + "'").first

    if place
      p "Place already there "
      p place
    end
    return place if place
    place_types = %w(free free air wild camp)
    place=Place.new(
      placetype: place_types[place_data['attributes']['place_type']],
      placename: place_data['attributes']['title'],
      geodata: { place_id: place_data['id']},
      display: 0,
      account: account,
      lat: place_data['attributes']['lat'],
      lng: place_data['attributes']['lng']
    )
    place.save
    place
  end

end

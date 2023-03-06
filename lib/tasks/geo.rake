namespace :geo do

  desc "mein Test"
  task geobla_move: :environment do
    WorkLimit = 1
    mytask = GeoUser.where("status < 2").first
    exit true unless mytask
    mytask.status=99
    mytask.save!
    service = ProcessHashtagsService.new
    begin
      user = User.where(account_id: mytask.account_id).first
      mystart = mytask.userdata['start'] || 0
      p "START: " + ENV['GEO_OLD_GEOBLA_HOST'] +  '/api/users/' + mytask.userdata['user_id'].to_s + '/activities?page=' + mystart.to_s + '&per_page=' + WorkLimit.to_s + '&lang=' + mytask.userdata['lang']
      json = JSON.parse(HTTP.get(ENV['GEO_OLD_GEOBLA_HOST'] +  '/api/users/' + mytask.userdata['user_id'].to_s + '/activities?page=' + mystart.to_s + '&per_page=' + WorkLimit.to_s + '&lang=' + mytask.userdata['lang']))
      json['data'][0..WorkLimit].each do |post|
        next unless post['type']=='activity'
        # check double entries status
        next if Status.where(account: user.account, created_at: DateTime.parse(post['attributes']['created_at'])).count>0
        # find place, if nio place skip
        next unless place_data = json['included'].find {|el|  el['type']=='place' && el['id'].to_s == post['attributes']['place_id'].to_s}
        #p place_data
        place = create_place(place_data, user.account)
        if post['attributes']['content']
          process_text  = post['attributes']['content']['body'] || post['attributes']['content']['report']
        else
          process_text  = ' '
        end
        last_status = nil
        first_post = true
        while process_text.length>0
          # Check post length

          if process_text.length>500
            cutoff = 500
            begin
              cutoff-=1
            end while process_text[cutoff]!=" " && cutoff>400
            this_text = process_text[0..cutoff]
            process_text = process_text[cutoff + 1..]
            p "THIS TEXTY: " + this_text
            p "CUTOFF:" + cutoff.to_s
          else
            this_text = process_text
            process_text = ""
          end

          status = Status.new
          status.language = mytask.userdata['lang']
          status.local = true
          status.account = user.account
          status.text = this_text
          status.conversation_id = place.status.conversation_id
          media_ids = []
          if first_post
            status.visibility = 0
            status.created_at = DateTime.parse(post['attributes']['created_at'])
            status.in_reply_to_id = place.status.id
            post["attributes"]["image_urls"][0..3].each do |photo|
              media_id = create_attachment(user,photo["srcSet"][photo["srcSet"].count-1].split.first)
              media_ids.push(media_id)
            end

            first_post = false
          else
            status.visibility = 1
            status.created_at = DateTime.parse(post['attributes']['created_at'])
            status.in_reply_to_id = last_status.id
          end
          status.media_attachments = media_ids
          status.save
          last_status = status
          ## manually call services
          service.call(status)
        end

      end
      if json['data'].count>=WorkLimit
        mytask.status=1
        mytask.userdata['start'] = mystart + WorkLimit
      else
        mytask.status=2
      end
    rescue => e
      mytask.status=9
      raise e
    end
    mytask.save!
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

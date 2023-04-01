namespace :geo do

  desc 'mein Test'
  task geobla_move: :environment do
    WorkLimit = 100
    mytask = GeoUser.where('status < 2').first
    exit true unless mytask
    mytask.status=99
    mytask.save!
    service = ProcessHashtagsService.new
    begin
      user = User.where(account_id: mytask.account_id).first
      I18n.locale = user.locale
        mystart = mytask.userdata['start'] || 0
      p 'START: ' + ENV.fetch('GEO_OLD_GEOBLA_HOST', nil) +  '/api/users/' + mytask.userdata['user_id'].to_s + '/activities?page=' + mystart.to_s + '&per_page=' + WorkLimit.to_s + '&lang=' + mytask.userdata['lang']
      json = JSON.parse(HTTP.get(ENV.fetch('GEO_OLD_GEOBLA_HOST', nil) +  '/api/users/' + mytask.userdata['user_id'].to_s + '/activities?page=' + mystart.to_s + '&per_page=' + WorkLimit.to_s + '&lang=' + mytask.userdata['lang']))
      json['data'][0..WorkLimit].each do |post|
        next unless post['type']=='activity'
        # check double entries status
        next if Status.where(account: user.account, created_at: DateTime.parse(post['attributes']['created_at'])).count>0
        # find place, if nio place skip
        next unless place_data = json['included'].find {|el|  el['type']=='place' && el['id'].to_s == post['attributes']['place_id'].to_s}
        p place_data
        place = create_place(place_data, user.account)
        process_text = if post['attributes']['content']
          post['attributes']['content']['body'] || post['attributes']['content']['report'] || "-"
        else
          '-'
        end
        last_status = nil
        first_post = true
        if (post['attributes']['created_at'][0..9]!=post['attributes']['time_at'][0..9])
          p "DATE ADDED!"
          process_text = I18n.t('geo.visited') + ' ' +  I18n.localize(DateTime.parse(post['attributes']['time_at']))+"\r\n\r\n" + process_text
        end
        while process_text.length>0
          # Check post length
          if process_text.length>500
            cutoff = 500
            begin
              cutoff-=1
            end while process_text[cutoff]!=' ' && cutoff>400
            this_text = process_text[0..cutoff]
            process_text = process_text[cutoff + 1..]
          else
            this_text = process_text
            process_text = ''
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
            post['attributes']['image_urls'][0..3].each do |photo|
              media_id = create_attachment(user,photo['srcSet'][photo['srcSet'].count-1].split.first)
              media_ids.push(media_id)
            end

            first_post = false
          else
            status.visibility = 1
            status.created_at = DateTime.parse(post['attributes']['created_at'])
            status.in_reply_to_id = last_status.id
          end
          status.media_attachments = media_ids
          p 'save'
          p status
          if media_ids == [] && this_text == ''
            p 'ONLY CHECKIN'

            next
          end
          status.save
          last_status = status
          ## manually call services
          service.call(status)
          Trends.tags.register(status) unless status.created_at < 1.month.ago
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
        attachment_id = attachment['id']
        File.delete(tempfile)
        rescue
          attachment_id = nil
      end
      attachment
  end

  def find_place(data, id); end

  def create_place ( place_data, account )
    place = Place.where("geodata->>'place_id' = '" + place_data['id'].to_s + "'").first

    if place
      p 'Place already there '
      p place
      unless place.status
        place.create_bot_post
      end
      place.add_visit! account
    end
    return place if place
    place_types = %w(free free paid wild camp)
    place=Place.new(
      created_at: DateTime.parse(place_data['attributes']['created_at']),
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

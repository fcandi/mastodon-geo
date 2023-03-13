class CreateGeoUsers < ActiveRecord::Migration[6.1]
  def change
    create_table :geo_users do |t|
      t.references :account, null: false, foreign_key: true
      t.integer :status
      t.jsonb :userdata

      t.timestamps
    end
  end
end

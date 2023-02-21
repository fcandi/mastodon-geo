class CreatePlaceFavs < ActiveRecord::Migration[6.1]
  def change
    create_table :place_favs do |t|
      t.references :account, null: false, foreign_key: true
      t.references :place, null: false, foreign_key: true

      t.timestamps
    end
    add_index :place_favs, [:account_id, :place_id], unique: true
  end
end

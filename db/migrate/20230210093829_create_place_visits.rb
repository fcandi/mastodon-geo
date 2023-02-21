class CreatePlaceVisits < ActiveRecord::Migration[6.1]
  def change
    create_table :place_visits do |t|
      t.integer :rating
      t.references :account, null: false, foreign_key: true
      t.references :place, null: false, foreign_key: true

      t.timestamps
    end
    add_index :place_visits, [:account_id, :place_id], unique: true
  end
end

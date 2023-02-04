class CreatePlaces < ActiveRecord::Migration[6.1]
  def change
    create_table :places do |t|
      t.string :placetype
      t.string :placename
      t.jsonb :geodata
      t.decimal :lat, precision: 10, scale: 6
      t.decimal :lng, precision: 10, scale: 6
      t.integer :display
      t.references :account, null: true, foreign_key: true
      t.references :status, null: true, foreign_key: true
      t.timestamps
    end
    add_index :places, [:lng, :lat], unique: false
    add_index :places, [:placetype], unique: false
    add_index :places, [:display], unique: false
  end
end

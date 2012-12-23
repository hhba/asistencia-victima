require 'geocoder'
require "fusion_tables"

table_id = '1xxoIwan9TAwkh_AMkmfYQKbyUdQAvbR5WTvtgzw'
username = ""
password = ""

ft = GData::Client::FusionTables.new
ft.clientlogin(username, password)

organizations = ft.execute "SELECT ROWID, address FROM #{table_id};"
organizations.each do |organization|
  location = Geocoder.search(organization[:address])
  query = <<-eos
UPDATE #{table_id}
SET geo = '#{location.first.latitude}, #{location.first.longitude}'
WHERE ROWID = '#{organization[:rowid]}';
  eos
  puts query
  ft.execute query
  sleep 1
end

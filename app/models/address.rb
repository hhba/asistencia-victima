require 'geocoder'

class Address
  include Mongoid::Document

  field :postal,    :type => String
  field :latitude,  :type => Float
  field :longitude, :type => Float

  embedded_in :organization
  
  before_create :get_latitude_and_longitude

  def get_latitude_and_longitude
    locations = Geocoder.search(self.postal)
    unless locations.empty?
      self.latitude = locations.first.latitude
      self.longitude = locations.first.longitude
    end
  end
end

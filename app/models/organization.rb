# encoding: utf-8

class Organization
  include Mongoid::Document

  field :name,                :type => String
  field :state,               :type => String
  field :town,                :type => String
  field :jurisdiction,        :type => String
  field :services,            :type => Array
  field :study_fields,        :type => Array
  field :communication_lines, :type => Array
  field :phone,               :type => String
  field :fax,                 :type => String
  field :email,               :type => String
  field :web,                 :type => String
  field :conditions,          :type => String
  field :documentation,       :type => String
  field :observations,        :type => String
  field :service_days,        :type => String
  field :service_hours,       :type => String

  embeds_many :addresses

  after_update :pick_icon

  def icon
    if self.services.length > 1
      "expert.png"
    elsif self.services.first == "Asesoramiento"
      "group.png"
    elsif self.services.first == "Patrocinio jurídico"
      "court.png"
    elsif self.services.first == "Atención psicológica"
      "communitycentre.png"
    else
      "expert.png"
    end
  end

  def address
    self.addresses.first.postal
  end

  def services_offered
    self.services.join(", ")
  end

  def latitude
    addresses.first.latitude
  end

  def longitude
    addresses.first.longitude
  end
end

require 'fusion_tables'

namespace :fusion do
  desc "Get data from FusionTables and populate DB"
  task :populate => :environment do
    ft = GData::Client::FusionTables.new
    organizations = ft.execute "SELECT * FROM 1xxoIwan9TAwkh_AMkmfYQKbyUdQAvbR5WTvtgzw"
    Organization.delete_all
    organizations.each do |organization|
      new_organization = Organization.new(
              :name => organization[:organismo],
              :state => organization[:provincia],
              :town => organization[:localidad],
              :jurisdiction => organization[:"jurisdicci\xC3\xB3n"],
              :phone => organization[:"tel\xC3\xA9fono"],
              :fax => organization[:fax],
              :email => organization[:email],
              :web => organization[:web],
              :conditions => organization[:condiciones],
              :documentation => organization[:"documentaci\xC3\xB3n"],
              :observations => organization[:observaciones],
              :service_days => organization[:"d\xC3\xADas_de_atenci\xC3\xB3n"],
              :service_hours => organization[:horarios]
              )
      new_organization.services = [organization[:servicio_1], organization[:servicio_2]].compact
      new_organization.study_fields = [
        organization[:temas_1],
        organization[:temas_2],
        organization[:temas_3],
        organization[:temas_4],
        organization[:temas_5],
        organization[:temas_6],
        organization[:temas_7],
        organization[:temas_8],
        organization[:temas_9],
        organization[:temas_10],
        organization[:temas_11],
        organization[:temas_12]
      ].compact
      new_organization.communication_lines = [
        organization[:medios_del_servicio_1],
        organization[:medios_del_servicio_2]
      ].compact
      new_organization.save
      new_organization.addresses.create :postal => organization[:"direcci\xC3\xB3n_maps"]
    end
  end
end



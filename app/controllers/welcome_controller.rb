class WelcomeController < ApplicationController
  def index
    @organizations = Organization.all
    @organization = Organization.new
  end
end

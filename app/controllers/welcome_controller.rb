class WelcomeController < ApplicationController
  def index
    @organizations = Organization.all
  end
end

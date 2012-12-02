require "bundler/capistrano"

set :user, "malev"
set :domain, "54.235.246.70"
set :environment, "production"
set :deploy_to, "/home/malev/apps/#{application}"

role :app, domain
role :web, domain
role :workers, domain
role :db, domain, :primary => true

set :normalize_asset_timestamps, false

require "bundler/capistrano"

server "54.235.246.70", :web, :app, :db, :primary => true

set :application, "asistencia-victima"
set :user, "malev"
set :deploy_to, "/home/#{user}/apps/#{application}"
set :deploy_via, :remote_cache
set :user_sudo, false

set :scm, :git
set :repository,  "git@github.com:hhba/asistencia-victima.git"
set :branch, "master"
set :scm_verbose, true

set :ssh_options, :forward_agent => true
default_run_options[:pty] = true
set :keep_releases, 5

namespace :deploy do
  %w[start stop restart].each do |command|
    desc "#{command} unicorn server"
    task command, :roles => :app, :except => {:no_release => true} do
      run "/etc/init.d/unicorn_#{application} #{command}"
    end
  end

  task :setup_config, :roles => :app do
    sudo "ln -nfs #{current_path}/config/nginx.conf /etc/nginx/sites-enabled/#{application}.conf"
    sudo "ln -nfs #{current_path}/config/unicorn_init.sh /etc/init.d/unicorn_#{application}.sh"
    run "mkdir -p #{shared_path}/config"
  end
  after "deploy:setup", "deploy:setup_config"

  desc "Make sure local git is in sync with remote."
  task :check_revision, :roles => :web do
    unless `git rev-parse HEAD` == `git rev-parse origin/master`
      puts "WARNING: HEAD is not the same as origin/master"
      puts "Run `git push` to sync changes."
    end
  end
  before "deploy", "deploy:check_revision"
end
# if you want to clean up old releases on each deploy uncomment this:
# after "deploy:restart", "deploy:cleanup"

# if you're still using the script/reaper helper you will need
# these http://github.com/rails/irs_process_scripts

# If you are using Passenger mod_rails uncomment this:
# namespace :deploy do
#   task :start do ; end
#   task :stop do ; end
#   task :restart, :roles => :app, :except => { :no_release => true } do
#     run "#{try_sudo} touch #{File.join(current_path,'tmp','restart.txt')}"
#   end
# end
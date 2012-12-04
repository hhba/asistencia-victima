require "bundler/capistrano"

set :application, "asistencia-victima"
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

set :bundle_flags, "--deployment --quiet --binstubs --shebang ruby-local-exec"

namespace :deploy do
  %w[start stop restart].each do |command|
    desc "#{command} unicorn server"
    task command, :roles => :app, :except => {:no_release => true} do
      run "chmod a+x #{current_path}/config/unicorn_init.sh"
      run "/etc/init.d/unicorn_#{application} #{command}"
    end
  end

  task :setup_config, :roles => :app do
    sudo "ln -nfs #{current_path}/config/nginx.conf /etc/nginx/sites-enabled/#{application}.conf"
    sudo "ln -nfs #{current_path}/config/unicorn_init.sh /etc/init.d/unicorn_#{application}"
    sudo "chmod a+x #{current_path}/config/unicorn_init.sh"
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

ifndef DEV_STACK_DIR
DEV_STACK_DIR = $(CURDIR)
endif
SCRIPTS_DIR=${DEV_STACK_DIR}/scripts

ifndef HOSTNAME
HOSTNAME = dotfile-tms.local
endif


ifndef SUBDOMAINS
SUBDOMAINS = traefik \
             portainer \
             redis
endif
ifndef INFRA
INFRA = traefik \
        portainer \
        postgres \
        redis \
		redis-webui
endif


export HOST_IP := $(shell ${SCRIPTS_DIR}/get-ip.sh)

# HELP
.PHONY: help

help: ## List of the command available, make {command}
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.DEFAULT_GOAL := help

start:  ## Start the docker stack
	docker compose up -d ${INFRA}

up: ## Start the docker stack
	docker compose up ${INFRA}

stop: ## Stop the docker stack
	docker compose stop

restart: ## Restart the docker stack
	docker compose restart

down: ## Down the docker stack and remove all containers and networks
	docker compose down

build: ## Build or rebuild all docker container
	docker compose build

pull: ## Pull latest image
	docker compose pull

add-hosts: ## Add Hosts entries for Dev stack
	${SCRIPTS_DIR}/manage-hosts.sh addhost ${HOSTNAME}
	$(foreach subdomain, $(SUBDOMAINS), ${SCRIPTS_DIR}/manage-hosts.sh addhost $(subdomain).$(HOSTNAME);)

remove-hosts: ## Remove Hosts entries for Dev stack
	${SCRIPTS_DIR}/manage-hosts.sh removehost ${HOSTNAME}
	$(foreach subdomain, $(SUBDOMAINS), ${SCRIPTS_DIR}/manage-hosts.sh removehost $(subdomain).$(HOSTNAME);)

certs-generate: ## Generate certs for all our domains
	mkcert -install
	mkcert -cert-file certs/local-cert.pem -key-file certs/local-key.pem $(HOSTNAME) *.$(HOSTNAME) $(SECONDARY_HOSTNAME)
	cp "$(shell mkcert -CAROOT)/rootCA.pem" certs/

certs-uninstall: ## Uninstall the local CA (but do not delete it)
	mkcert -uninstall

# DATABASE
run-sql: ## database command (/!\ work only with psql so far)
	docker compose exec postgres psql -U root -d main_db

create-db: ## create a new database: make create-db DB_NAME=main_db (/!\ work only with psql so far)
	docker compose exec postgres psql -U root -d postgres -c "CREATE DATABASE $(DB_NAME)"

drop-db: ## drop database: make drop-db DB_NAME=main_db (/!\ work only with psql so far)
	docker compose exec postgres psql -U root -d postgres -c "DROP DATABASE $(DB_NAME)"

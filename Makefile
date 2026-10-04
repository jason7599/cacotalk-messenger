# Production (run from the EC2 instance)
PROD = docker compose -f docker-compose.prod.yml

rebuild-fe:
	$(PROD) build frontend
	$(PROD) up -d frontend

rebuild-be:
	$(PROD) build backend
	$(PROD) up -d backend

rebuild:
	$(PROD) build
	$(PROD) up -d

db:
	$(PROD) exec postgres sh -c 'psql -U "$$POSTGRES_USER" -d cacotalk'

ps:
	$(PROD) ps

logs:
	$(PROD) logs -f
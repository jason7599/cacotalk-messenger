up:
	docker compose up -d

down:
	docker compose down

db:
	docker compose exec postgres psql -U jux cacotalk

redis:
	docker compose exec redis redis-cli

redis-scan:
	docker compose exec redis redis-cli SCAN 0

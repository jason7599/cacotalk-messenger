db:
	docker compose exec postgres psql -U jux cacotalk

redis:
	docker compose exec redis redis-cli

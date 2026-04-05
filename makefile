# Define individual targets
.PHONY: dev-backend dev-frontend dev-api

dev-backend:
	cd ~/dev/time-management-app/backend && npm run dev

dev-frontend:
	cd ~/dev/time-management-app/frontend && npm run dev

# Optional third service (e.g., anapi npm service)
dev-api:
	cd ~/dev/time-management-app/api && source venv/bin/activate && uvicorn main:app --reload

# Master target to run all concurrently
# Use -j to allow multiple jobs to run at once
dev:
	$(MAKE) -j 3 dev-backend dev-frontend dev-api

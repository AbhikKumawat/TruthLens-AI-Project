import httpx
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("truthlens.webhook_client")

class WebhookClient:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=10.0)

    async def trigger_webhook(self, url: str, event_type: str, data: Dict[str, Any]) -> bool:
        """
        Sends an asynchronous POST request to the target webhook URL with event metadata and payload.
        """
        payload = {
            "event": event_type,
            "timestamp": data.get("completed_at") or data.get("created_at"),
            "data": data
        }
        
        try:
            logger.info(f"Triggering webhook to {url} for event {event_type}")
            response = await self.client.post(url, json=payload)
            if response.status_code >= 200 and response.status_code < 300:
                logger.info(f"Webhook delivered successfully to {url} (Status: {response.status_code})")
                return True
            else:
                logger.error(f"Webhook delivery failed to {url} with status code: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"Error delivery webhook to {url}: {e}")
            return False

    async def close(self):
        await self.client.aclose()
        logger.info("Webhook HTTPX client closed.")

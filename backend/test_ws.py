import asyncio
import websockets

async def test():
    async with websockets.connect("ws://localhost:8000/ws") as ws:
        try:
            async with asyncio.timeout(15):
                while True:
                    message = await ws.recv()
                    print("Received:", message)
        except TimeoutError:
            print("Done listening (15s elapsed).")

asyncio.run(test())
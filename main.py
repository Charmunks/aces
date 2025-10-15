# this code is going to serve the static files and thats probably all, maybe like an api endpoint or two

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pyairtable import Api
from pyairtable.formulas import match
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import os
import dotenv

dotenv.load_dotenv()

limiter = Limiter(key_func=get_remote_address)
airtable_api = Api(os.getenv("AIRTABLE_API_KEY", "")) # just for typechecking :3
app = FastAPI()
@app.exception_handler(RateLimitExceeded)
def redirect_to_failover(request: Request, exc):
    return RedirectResponse("https://failover.hackclub.dev/", 303)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, redirect_to_failover)  # type: ignore
app.add_middleware(SlowAPIMiddleware) 


@app.get("/")
@limiter.limit("8/minute")
async def serve_root(request: Request):
    return FileResponse("static/index.html")

# @app.get("/requirements")
# async def serve_requirements():
#     return FileResponse("static/requirements.html")
# app.mount("/static", StaticFiles(directory="./static"), name="static")

@app.get("/api/referral")
@limiter.limit("8/minute")
async def referral_validator(request: Request, referral: int):
    # print(os.getenv("AIRTABLE_BASE_ID"))
    # print(os.getenv("AIRTABLE_TABLE_ID_S3"))
    if not (os.getenv("AIRTABLE_BASE_ID", "")) or not (os.getenv("AIRTABLE_TABLE_ID", "")):
        raise HTTPException(500)
    table = airtable_api.table(os.getenv("AIRTABLE_BASE_ID", ""), os.getenv("AIRTABLE_TABLE_ID", ""))        
    results = table.all(
        formula=match({"referral codde THEIR": referral}), 
        # sort=["Submitted At"]
    )

    return {
        "valid": len(results) > 0, 
        # "referral_checked": referral
    }

# mounting static directory for our static files, and serving it at /static
app.mount("/static", StaticFiles(directory="static"), name="frontend")

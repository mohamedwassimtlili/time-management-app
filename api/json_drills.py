import json
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="train")
tasks = [
    {"title": "study", "done": False},
    {"title": "gym", "done": True},
    {"title": "sleep", "done": False}
]
count=0
lst= []
for t in tasks:
    if t["done"] : 
        count += 1
        lst.append(t)
    print(t["title"])
print(count)
completed = {
    "completed":lst
}
print(completed)

def buildJson(name,city):
    return {
        "name":name,
        "city":city
    }

@app.get("/")
def root():
    return buildJson("mohsen","newyork")

class Credentials(BaseModel):
    username: str
    password: str

@app.post("/")
def signin(req :Credentials):
    name=req.username
    pwd = req.password
    pwd = pwd[::-1]
    return {
        "name":name,
        "passwd":pwd
    }
    
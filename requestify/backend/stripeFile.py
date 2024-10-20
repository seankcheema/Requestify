#Imports stripe library, way to access env variables (os) and for loading env vars from .env
import stripe
import os
from dotenv import load_dotenv

#Lodas env var from .env
load_dotenv(".env")

#Sets up the stripe api key from the env var
REACT_APP_STRIPE_SECRET_KEY = os.getenv('REACT_APP_STRIPE_SECRET_KEY')

if not REACT_APP_STRIPE_SECRET_KEY:
    raise Exception('Stripe secret key not found')

#Initializes the stripe client w/ secret key
stripe.api_key = REACT_APP_STRIPE_SECRET_KEY

def create_tip_payment(amount, currency):
    """
    amount is an integer w/ the amount in the smallest currency ynit, like cents for usd
    currency is a string with the currency code, like 'usd'
    Returns a dictionary w/ the client secret for the payment intent
    """
    payment_intent = stripe.PaymentIntent.create(
        amount=amount,
        currency=currency,
        payment_method_types=['card'],  # Allow card payments
        description='Tip Payment'
    )
    return {"client_secret": payment_intent['client_secret']}

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

def create_tip_payment(amount, currency, payment_method_types):
    """
    Creates a Stripe PaymentIntent for the given amount, currency, and payment methods.
    - amount: integer in the smallest currency unit (e.g., cents for USD)
    - currency: string currency code (e.g., 'usd')
    - payment_method_types: list of accepted payment methods (e.g., ['card', 'paypal'])
    Returns: A dictionary with the client secret for the PaymentIntent
    """
    payment_intent = stripe.PaymentIntent.create(
        amount=amount,
        currency=currency,
        payment_method_types=payment_method_types,
        description='Tip Payment'
    )
    return {"client_secret": payment_intent['client_secret']}

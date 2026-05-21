"""
Cognito Custom Email Sender Lambda
Uses raw boto3 KMS decrypt — no aws-encryption-sdk dependency.
Sends branded Sourcery emails via Resend API.
"""
import base64
import json
import logging
import os

import boto3
import requests

logger = logging.getLogger()
logger.setLevel(logging.INFO)

RESEND_API_KEY = os.environ["RESEND_API_KEY"]
KMS_KEY_ARN    = os.environ["KMS_KEY_ARN"]
FROM_ADDRESS   = os.environ.get("FROM_ADDRESS", "Sourcery <onboarding@resend.dev>")

_kms = boto3.client("kms")


def _decrypt_code(encrypted_b64: str) -> str:
    resp = _kms.decrypt(
        CiphertextBlob=base64.b64decode(encrypted_b64),
        KeyId=KMS_KEY_ARN,
    )
    return resp["Plaintext"].decode("utf-8")


def _build_email(trigger_source: str, code: str) -> dict:
    base_url = "https://main.dh20jci5d0961.amplifyapp.com"

    if trigger_source in ("CustomEmailSender_SignUp", "CustomEmailSender_ResendCode"):
        subject = "Your Sourcery verification code"
        heading = "Verify your email"
        body_text = (
            "Welcome to Sourcery! Enter this code to confirm your email address "
            "and start uncovering profitable dropshipping products."
        )
        expiry_note = "This code expires in 24 hours."

    elif trigger_source == "CustomEmailSender_ForgotPassword":
        subject = "Reset your Sourcery password"
        heading = "Password reset"
        body_text = "We received a request to reset your Sourcery password. Enter the code below to continue."
        expiry_note = "This code expires in 1 hour. If you didn't request this, you can ignore this email."

    elif trigger_source in (
        "CustomEmailSender_UpdateUserAttribute",
        "CustomEmailSender_VerifyUserAttribute",
    ):
        subject = "Confirm your new email address"
        heading = "Confirm email change"
        body_text = "Enter this code to confirm your new email address on Sourcery."
        expiry_note = "This code expires in 24 hours."

    else:
        subject = "Your Sourcery verification code"
        heading = "Verification code"
        body_text = "Use this code to verify your identity on Sourcery."
        expiry_note = "This code expires shortly."

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{subject}</title>
</head>
<body style="margin:0;padding:0;background:#0f0c1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0c1a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;">

          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:22px;font-weight:800;color:#A78BFA;">✦ Sourcery</span>
            </td>
          </tr>

          <tr>
            <td style="background:rgba(14,10,28,0.95);border:1px solid rgba(139,92,246,0.2);border-radius:16px;padding:40px 36px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#5A4F7A;">Sourcery</p>
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#F0EEFF;">{heading}</h1>
              <p style="margin:0 0 32px;font-size:14px;line-height:1.7;color:#9B8ECF;">{body_text}</p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:24px;background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:12px;">
                    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#5A4F7A;">Verification code</p>
                    <p style="margin:0;font-size:36px;font-weight:800;letter-spacing:0.18em;color:#F0EEFF;font-variant-numeric:tabular-nums;">{code}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:12px;color:#5A4F7A;line-height:1.6;">{expiry_note}</p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#3D3459;line-height:1.6;">
                Sourcery &middot; <a href="{base_url}" style="color:#5A4F7A;text-decoration:none;">getsourcery.app</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    text = f"{heading}\n\n{body_text}\n\nYour code: {code}\n\n{expiry_note}\n\n--\nSourcery | {base_url}"
    return {"subject": subject, "html": html, "text": text}


def lambda_handler(event, context):
    logger.info("CustomEmailSender trigger: %s", event.get("triggerSource"))

    try:
        encrypted_code = event["request"].get("code")
        if not encrypted_code:
            logger.warning("No code in event — skipping send")
            return event

        code = _decrypt_code(encrypted_code)

        email = event["request"].get("userAttributes", {}).get("email", "")
        if not email:
            raise ValueError("No email address in userAttributes")

        payload = _build_email(event.get("triggerSource", ""), code)

        resp = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type":  "application/json",
            },
            json={
                "from":    FROM_ADDRESS,
                "to":      [email],
                "subject": payload["subject"],
                "html":    payload["html"],
                "text":    payload["text"],
            },
            timeout=15,
        )
        resp.raise_for_status()
        logger.info("Email sent via Resend — id=%s to=%s", resp.json().get("id"), email)

    except Exception as exc:
        logger.exception("Failed to send email: %s", exc)

    return event

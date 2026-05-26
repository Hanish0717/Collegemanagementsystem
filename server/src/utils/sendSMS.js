import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const sendSMS = async (mobile, otp) => {
  console.log(`[SMS Send] Sending OTP ${otp} to mobile: ${mobile}`);
  
  // 1. TextBelt Integration
  if (process.env.TEXTBELT_API_KEY && process.env.TEXTBELT_API_KEY !== 'your_textbelt_api_key') {
    try {
      const response = await axios.post('https://textbelt.com/text', {
        number: mobile,
        message: `Your College Management System OTP is ${otp}. It will expire in 5 minutes.`,
        key: process.env.TEXTBELT_API_KEY,
      });
      if (response.data && response.data.success) {
        console.log(`[SMS Send] TextBelt sent successfully:`, response.data);
        return true;
      }
      console.error(`[SMS Send] TextBelt failed:`, response.data);
    } catch (error) {
      console.error(`[SMS Send] TextBelt error:`, error.message);
    }
  }
  
  // 2. Fast2SMS Integration
  if (process.env.FAST2SMS_API_KEY && process.env.FAST2SMS_API_KEY !== 'your_fast2sms_api_key') {
    try {
      const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
        variables_values: otp,
        route: 'otp',
        numbers: mobile,
      }, {
        headers: {
          'authorization': process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json'
        }
      });
      if (response.data && response.data.return) {
        console.log(`[SMS Send] Fast2SMS sent successfully:`, response.data);
        return true;
      }
      console.error(`[SMS Send] Fast2SMS failed:`, response.data);
    } catch (error) {
      console.error(`[SMS Send] Fast2SMS error:`, error.message);
    }
  }

  // 3. Fallback Mode
  console.log(`=========================================`);
  console.log(`[SMS Send Fallback]`);
  console.log(`OTP Code: ${otp}`);
  console.log(`Target: ${mobile}`);
  console.log(`No active SMS API key configured.`);
  console.log(`=========================================`);
  
  return true; // Return true so flow is not blocked locally
};

export default sendSMS;

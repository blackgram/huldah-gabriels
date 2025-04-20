/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
// server.js
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config({ path: './.env.local' });


const app = express();
app.use(express.json());
app.use(cors());

// Custom logging middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  console.log('📧 [send-email] Request received');
  try {
    console.log('📧 [send-email] Extracting request body');
    const { to, subject, html } = req.body;
    
    console.log(`📧 [send-email] Sending to: ${to}`);
    console.log(`📧 [send-email] Subject: ${subject}`);
    
    console.log('📧 [send-email] Creating transporter');
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Force IPv4 to avoid connection issues
      family: 4,
      // Enable detailed transport logging
      debug: true,
      logger: true
    });
    
    console.log('📧 [send-email] Verifying transporter');
    try {
      await transporter.verify();
      console.log('📧 [send-email] Transporter verification successful');
    } catch (verifyError) {
      console.error('❌ [send-email] Transporter verification failed:', verifyError);
      // Continue anyway as verification sometimes fails but sending works
    }
    
    console.log('📧 [send-email] Sending email');
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    
    console.log(`📧 [send-email] Email sent successfully! ID: ${info.messageId}`);
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('❌ [send-email] Error sending email:', error);
    
    // Log detailed error information
    if (error) {
      console.error('❌ [send-email] Error name:', error.name);
      console.error('❌ [send-email] Error message:', error.message);
      console.error('❌ [send-email] Error stack:', error.stack);
      
      // Log additional properties for nodemailer errors
      if (error.code) console.error('❌ [send-email] Error code:', error.code);
      if (error.command) console.error('❌ [send-email] Error command:', error.command);
      if (error.response) console.error('❌ [send-email] Error response:', error.response);
    }
    
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk email endpoint
app.post('/api/send-bulk-email', async (req, res) => {
  console.log('📧 [send-bulk-email] Request received');
  try {
    console.log('📧 [send-bulk-email] Extracting request body');
    const { recipients, subject, html } = req.body;
    
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      console.error('❌ [send-bulk-email] Invalid or empty recipients array');
      return res.status(400).json({ 
        success: false, 
        error: 'Recipients array is required' 
      });
    }
    
    console.log(`📧 [send-bulk-email] Recipients count: ${recipients.length}`);
    console.log(`📧 [send-bulk-email] Subject: ${subject}`);
    
    console.log('📧 [send-bulk-email] Creating transporter');
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Force IPv4 to avoid connection issues
      family: 4,
      // Enable detailed transport logging
      debug: true,
      logger: true
    });

    console.log('📧 [send-bulk-email] Transporter configuration:', {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      user: process.env.EMAIL_USER ? '✓ set' : '❌ not set',
      pass: process.env.EMAIL_PASSWORD ? '✓ set' : '❌ not set',
      family: 4
    });
    
    console.log('📧 [send-bulk-email] Verifying transporter');
    try {
      await transporter.verify();
      console.log('📧 [send-bulk-email] Transporter verification successful');
    } catch (verifyError) {
      console.error('❌ [send-bulk-email] Transporter verification failed:', verifyError);
      // Continue anyway as verification sometimes fails but sending works
    }
    
    // For tracking which emails were sent successfully
    const successfulEmails = [];
    const failedEmails = [];
    
    // Send emails in batches to avoid rate limits
    const batchSize = 50;
    
    console.log(`📧 [send-bulk-email] Processing ${recipients.length} emails in batches of ${batchSize}`);
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      console.log(`📧 [send-bulk-email] Processing batch ${batchNumber} (${batch.length} recipients)`);
      
      const emailPromises = batch.map(recipient => {
        // Personalize email if name is provided
        let personalizedHtml = html;
        if (recipient.name) {
          personalizedHtml = html.replace(
            '<p>Thank you for joining our waitlist',
            `<p>Thank you ${recipient.name} for joining our waitlist`
          );
          console.log(`📧 [send-bulk-email] Personalized email for: ${recipient.name}`);
        }
        
        console.log(`📧 [send-bulk-email] Sending to: ${recipient.email}`);
        return transporter.sendMail({
          from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
          to: recipient.email,
          subject,
          html: personalizedHtml,
        }).then(info => {
          console.log(`📧 [send-bulk-email] Successfully sent to: ${recipient.email}, ID: ${info.messageId}`);
          successfulEmails.push(recipient.email);
          return info;
        }).catch(error => {
          console.error(`❌ [send-bulk-email] Failed to send to: ${recipient.email}`, error);
          console.error(`❌ [send-bulk-email] Error message: ${error.message}`);
          if (error.code) console.error(`❌ [send-bulk-email] Error code: ${error.code}`);
          
          failedEmails.push({ email: recipient.email, error: error.message });
          return null;
        });
      });
      
      console.log(`📧 [send-bulk-email] Waiting for batch ${batchNumber} to complete`);
      await Promise.all(emailPromises);
      
      // Add a small delay between batches
      if (i + batchSize < recipients.length) {
        console.log(`📧 [send-bulk-email] Adding 2-second delay between batches`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`📧 [send-bulk-email] All batches processed. Success: ${successfulEmails.length}, Failed: ${failedEmails.length}`);
    
    res.json({ 
      success: true, 
      sent: successfulEmails.length,
      failed: failedEmails.length,
      successfulEmails,
      failedEmails
    });
  } catch (error) {
    console.error('❌ [send-bulk-email] Error processing bulk email:', error);
    
    // Log detailed error information
    if (error) {
      console.error('❌ [send-bulk-email] Error name:', error.name);
      console.error('❌ [send-bulk-email] Error message:', error.message);
      console.error('❌ [send-bulk-email] Error stack:', error.stack);
      
      // Log additional properties for nodemailer errors
      if (error.code) console.error('❌ [send-bulk-email] Error code:', error.code);
      if (error.command) console.error('❌ [send-bulk-email] Error command:', error.command);
      if (error.response) console.error('❌ [send-bulk-email] Error response:', error.response);
    }
    
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test email endpoint
app.post('/api/send-test-email', async (req, res) => {
  console.log('📧 [send-test-email] Request received');
  try {
    console.log('📧 [send-test-email] Extracting request body');
    const { to, subject, html } = req.body;
    
    console.log(`📧 [send-test-email] Sending to: ${to}`);
    console.log(`📧 [send-test-email] Subject: ${subject}`);
    
    console.log('📧 [send-test-email] Creating transporter');
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Force IPv4 to avoid connection issues
      family: 4,
      // Enable detailed transport logging
      debug: true,
      logger: true
    });
    
    console.log('📧 [send-test-email] Verifying transporter');
    try {
      await transporter.verify();
      console.log('📧 [send-test-email] Transporter verification successful');
    } catch (verifyError) {
      console.error('❌ [send-test-email] Transporter verification failed:', verifyError);
      // Continue anyway as verification sometimes fails but sending works
    }
    
    console.log('📧 [send-test-email] Sending test email');
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to,
      subject: `[TEST] ${subject}`,
      html,
    });
    
    console.log(`📧 [send-test-email] Test email sent successfully! ID: ${info.messageId}`);
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('❌ [send-test-email] Error sending test email:', error);
    
    // Log detailed error information
    if (error) {
      console.error('❌ [send-test-email] Error name:', error.name);
      console.error('❌ [send-test-email] Error message:', error.message);
      console.error('❌ [send-test-email] Error stack:', error.stack);
      
      // Log additional properties for nodemailer errors
      if (error.code) console.error('❌ [send-test-email] Error code:', error.code);
      if (error.command) console.error('❌ [send-test-email] Error command:', error.command);
      if (error.response) console.error('❌ [send-test-email] Error response:', error.response);
    }
    
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add a simple diagnostic endpoint
app.get('/api/email-diagnostics', async (req, res) => {
  console.log('📧 [diagnostics] Running email diagnostics');
  
  try {
    // Check if required environment variables are set
    const envCheck = {
      EMAIL_HOST: !!process.env.EMAIL_HOST,
      EMAIL_PORT: !!process.env.EMAIL_PORT,
      EMAIL_USER: !!process.env.EMAIL_USER,
      EMAIL_PASSWORD: !!process.env.EMAIL_PASSWORD,
      EMAIL_FROM: !!process.env.EMAIL_FROM
    };
    
    console.log('📧 [diagnostics] Environment variables check:', envCheck);
    
    // Test DNS resolution for the email host
    const dns = require('dns');
    const host = process.env.EMAIL_HOST;
    
    console.log(`📧 [diagnostics] Resolving DNS for ${host}`);
    
    const dnsResults = {
      ipv4: null,
      ipv6: null,
      error: null
    };
    
    try {
      // Check IPv4 address
      const ipv4 = await new Promise((resolve, reject) => {
        dns.resolve4(host, (err, addresses) => {
          if (err) reject(err);
          else resolve(addresses);
        });
      });
      dnsResults.ipv4 = ipv4;
      console.log(`📧 [diagnostics] IPv4 addresses for ${host}:`, ipv4);
    } catch (e) {
      dnsResults.error = e.message;
      console.error(`❌ [diagnostics] Failed to resolve IPv4 for ${host}:`, e);
    }
    
    try {
      // Check IPv6 address
      const ipv6 = await new Promise((resolve, reject) => {
        dns.resolve6(host, (err, addresses) => {
          if (err) reject(err);
          else resolve(addresses);
        });
      });
      dnsResults.ipv6 = ipv6;
      console.log(`📧 [diagnostics] IPv6 addresses for ${host}:`, ipv6);
    } catch (e) {
      console.error(`❌ [diagnostics] Failed to resolve IPv6 for ${host}:`, e);
    }
    
    // Test connection to mail server
    console.log(`📧 [diagnostics] Testing connection to ${host}:${process.env.EMAIL_PORT}`);
    let connectionTest = { success: false, error: null };
    
    try {
      const net = require('net');
      const socket = new net.Socket();
      
      const connectionResult = await new Promise((resolve, reject) => {
        socket.connect(parseInt(process.env.EMAIL_PORT), host, { family: 4 });
        
        socket.on('connect', () => {
          console.log(`📧 [diagnostics] Successfully connected to ${host}:${process.env.EMAIL_PORT}`);
          socket.end();
          resolve({ success: true });
        });
        
        socket.on('error', (err) => {
          console.error(`❌ [diagnostics] Connection error to ${host}:${process.env.EMAIL_PORT}`, err);
          reject(err);
        });
        
        // Set timeout
        setTimeout(() => {
          socket.destroy();
          reject(new Error('Connection timeout'));
        }, 5000);
      });
      
      connectionTest = connectionResult;
    } catch (e) {
      connectionTest.error = e.message;
      console.error(`❌ [diagnostics] Connection test failed:`, e);
    }
    
    // Try to create a transporter and verify it
    console.log('📧 [diagnostics] Testing email transport configuration');
    let transporterTest = { success: false, error: null };
    
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        family: 4
      });
      
      await transporter.verify();
      transporterTest.success = true;
      console.log('📧 [diagnostics] Transporter verification successful');
    } catch (e) {
      transporterTest.error = e.message;
      console.error('❌ [diagnostics] Transporter verification failed:', e);
    }
    
    // Return results
    const results = {
      environment: envCheck,
      dns: dnsResults,
      connection: connectionTest,
      transporter: transporterTest,
      timestamp: new Date().toISOString()
    };
    
    console.log('📧 [diagnostics] Diagnostics complete:', results);
    res.json(results);
  } catch (error) {
    console.error('❌ [diagnostics] Error running diagnostics:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`====================================`);
  console.log(`🚀 Email server running on port ${PORT}`);
  console.log(`====================================`);
});
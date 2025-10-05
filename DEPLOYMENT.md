# 🚀 Deployment Guide

This guide covers deploying the Invoice & Quotation System to various platforms.

## 📋 Pre-deployment Checklist

### ✅ **Environment Setup**
- [ ] Supabase project created and configured
- [ ] Database schema deployed
- [ ] Environment variables configured
- [ ] Build process tested locally
- [ ] All features tested and working

### ✅ **Required Environment Variables**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🌐 Deployment Options

### **Option 1: Vercel (Recommended)**

#### **Step 1: Prepare Repository**
1. Push your code to GitHub
2. Ensure all environment variables are set

#### **Step 2: Deploy to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy

#### **Step 3: Configure Domain (Optional)**
1. Add custom domain in Vercel dashboard
2. Update DNS settings
3. SSL certificate will be automatically provisioned

### **Option 2: Netlify**

#### **Step 1: Build Configuration**
1. Ensure `next.config.js` has `output: 'export'` enabled
2. Build the project: `npm run build`

#### **Step 2: Deploy to Netlify**
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the `out` folder
3. Or connect GitHub repository for automatic deployments

#### **Step 3: Environment Variables**
1. Go to Site Settings → Environment Variables
2. Add your Supabase credentials

### **Option 3: Self-Hosted (VPS/Dedicated Server)**

#### **Step 1: Server Setup**
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2
```

#### **Step 2: Deploy Application**
```bash
# Clone repository
git clone https://github.com/yourusername/invoice-system.git
cd invoice-system

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2
pm2 start npm --name "invoice-system" -- start
pm2 save
pm2 startup
```

#### **Step 3: Nginx Configuration**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🗄️ Database Deployment

### **Supabase Setup**
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to SQL Editor
4. Run the schema from `database/schema.sql`
5. Configure Row Level Security (RLS) if needed
6. Copy project URL and anon key

### **Database Migration**
```sql
-- Run this in Supabase SQL Editor
-- File: database/schema.sql

-- Create customers table
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  billing_address TEXT,
  shipping_address TEXT,
  gst_number VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Continue with rest of schema...
```

## 🔧 Configuration

### **Next.js Configuration**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // For static export (Netlify, GitHub Pages)
  output: 'export',
  trailingSlash: true,
  
  // For server-side rendering (Vercel, self-hosted)
  // output: undefined,
  
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
```

### **Environment Variables**
```env
# Production Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

## 🔒 Security Considerations

### **Supabase Security**
1. Enable Row Level Security (RLS)
2. Configure proper policies
3. Use service role key only on server-side
4. Regularly rotate API keys

### **Application Security**
1. Validate all user inputs
2. Sanitize data before PDF generation
3. Implement proper error handling
4. Use HTTPS in production
5. Keep dependencies updated

## 📊 Monitoring & Analytics

### **Performance Monitoring**
1. Set up Vercel Analytics (if using Vercel)
2. Configure Google Analytics
3. Monitor Core Web Vitals
4. Set up error tracking (Sentry)

### **Database Monitoring**
1. Monitor Supabase dashboard
2. Set up alerts for high usage
3. Regular database backups
4. Monitor query performance

## 🚨 Troubleshooting

### **Common Issues**

#### **Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### **Environment Variables Not Loading**
- Check variable names (must start with `NEXT_PUBLIC_`)
- Restart development server after changes
- Verify variables in deployment platform

#### **Database Connection Issues**
- Verify Supabase URL and key
- Check network connectivity
- Ensure RLS policies allow access

#### **PDF Generation Issues**
- Check font loading
- Verify image paths
- Test with different browsers

### **Performance Optimization**
1. Enable Next.js Image Optimization
2. Implement proper caching headers
3. Optimize bundle size
4. Use CDN for static assets
5. Implement lazy loading

## 📈 Scaling Considerations

### **Database Scaling**
- Monitor Supabase usage limits
- Implement connection pooling
- Consider read replicas for reports
- Optimize queries with indexes

### **Application Scaling**
- Use serverless functions for heavy operations
- Implement caching strategies
- Consider CDN for global distribution
- Monitor and optimize bundle size

## 🎯 Post-Deployment

### **Testing Checklist**
- [ ] All pages load correctly
- [ ] Database operations work
- [ ] PDF generation functions
- [ ] Custom columns display properly
- [ ] Reports generate correctly
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

### **Go-Live Steps**
1. Final testing in production environment
2. DNS configuration (if using custom domain)
3. SSL certificate verification
4. Performance testing
5. User acceptance testing
6. Documentation update
7. Team training

---

**Your invoice management system is now ready for production! 🎉**

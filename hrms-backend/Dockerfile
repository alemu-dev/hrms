FROM php:8.2-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    libzip-dev \
    && docker-php-ext-install pdo pdo_mysql zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy project files
COPY . .

# Install Laravel dependencies
RUN composer install --no-dev --optimize-autoloader

# Fix permissions (important for Laravel)
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage

# Expose port (Render uses 10000)
EXPOSE 10000

# ✅ FIXED START COMMAND (works on Render free tier)
CMD ["sh", "-c", "php artisan migrate --force && php artisan config:clear && php artisan serve --host=0.0.0.0 --port=10000"]
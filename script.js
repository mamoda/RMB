        // ============== نظام إدارة الحالة ==============
        class Store {
            constructor() {
                this.state = {
                    user: null,
                    cart: [],
                    wishlist: [],
                    products: [],
                    isAuthenticated: false
                };
                
                this.listeners = [];
                this.loadFromStorage();
            }
            
            // تحميل البيانات من localStorage
            loadFromStorage() {
                const savedUser = localStorage.getItem('moda_user');
                const savedCart = localStorage.getItem('moda_cart');
                const savedWishlist = localStorage.getItem('moda_wishlist');
                
                if (savedUser) {
                    this.state.user = JSON.parse(savedUser);
                    this.state.isAuthenticated = true;
                }
                
                if (savedCart) {
                    this.state.cart = JSON.parse(savedCart);
                }
                
                if (savedWishlist) {
                    this.state.wishlist = JSON.parse(savedWishlist);
                }
            }
            
            // حفظ البيانات في localStorage
            saveToStorage() {
                localStorage.setItem('moda_user', JSON.stringify(this.state.user));
                localStorage.setItem('moda_cart', JSON.stringify(this.state.cart));
                localStorage.setItem('moda_wishlist', JSON.stringify(this.state.wishlist));
            }
            
            // الاشتراك في التغييرات
            subscribe(listener) {
                this.listeners.push(listener);
                return () => {
                    this.listeners = this.listeners.filter(l => l !== listener);
                };
            }
            
            // إعلام المستمعين بالتغييرات
            notify() {
                this.listeners.forEach(listener => listener(this.state));
            }
            
            // تحديث الحالة
            setState(newState) {
                this.state = { ...this.state, ...newState };
                this.saveToStorage();
                this.notify();
            }
            
            // إضافة منتج للسلة
            addToCart(product) {
                const existingItem = this.state.cart.find(item => item.id === product.id);
                
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    this.state.cart.push({ ...product, quantity: 1 });
                }
                
                this.saveToStorage();
                this.notify();
                return this.state.cart;
            }
            
            // إزالة منتج من السلة
            removeFromCart(productId) {
                this.state.cart = this.state.cart.filter(item => item.id !== productId);
                this.saveToStorage();
                this.notify();
                return this.state.cart;
            }
            
            // تحديث كمية المنتج في السلة
            updateCartItemQuantity(productId, quantity) {
                const item = this.state.cart.find(item => item.id === productId);
                if (item) {
                    item.quantity = quantity;
                    if (quantity <= 0) {
                        this.removeFromCart(productId);
                    }
                }
                this.saveToStorage();
                this.notify();
                return this.state.cart;
            }
            
            // إضافة للمفضلة
            toggleWishlist(product) {
                const index = this.state.wishlist.findIndex(item => item.id === product.id);
                
                if (index === -1) {
                    this.state.wishlist.push(product);
                } else {
                    this.state.wishlist.splice(index, 1);
                }
                
                this.saveToStorage();
                this.notify();
                return this.state.wishlist;
            }
            
            // تسجيل الدخول
            login(userData) {
                this.state.user = userData;
                this.state.isAuthenticated = true;
                this.saveToStorage();
                this.notify();
            }
            
            // تسجيل الخروج
            logout() {
                this.state.user = null;
                this.state.isAuthenticated = false;
                this.saveToStorage();
                this.notify();
            }
            
            // الحصول على إجمالي السلة
            getCartTotal() {
                return this.state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
            }
            
            // الحصول على عدد عناصر السلة
            getCartCount() {
                return this.state.cart.reduce((count, item) => count + item.quantity, 0);
            }
        }

        // ============== نظام الإشعارات ==============
        class NotificationSystem {
            constructor(containerId) {
                this.container = document.getElementById(containerId);
                this.notifications = [];
            }
            
            show(message, type = 'info', title = '') {
                const id = Date.now() + Math.random();
                const titles = {
                    success: 'تم بنجاح',
                    error: 'خطأ',
                    warning: 'تنبيه',
                    info: 'إشعار'
                };
                
                const notification = {
                    id,
                    title: title || titles[type],
                    message,
                    type
                };
                
                this.notifications.push(notification);
                this.render(notification);
                
                // إزالة الإشعار بعد 5 ثواني
                setTimeout(() => {
                    this.remove(id);
                }, 5000);
            }
            
            render(notification) {
                const notificationEl = document.createElement('div');
                notificationEl.className = `notification ${notification.type}`;
                notificationEl.id = `notification-${notification.id}`;
                
                const icons = {
                    success: 'fa-check-circle',
                    error: 'fa-exclamation-circle',
                    warning: 'fa-exclamation-triangle',
                    info: 'fa-info-circle'
                };
                
                notificationEl.innerHTML = `
                    <div class="notification-icon">
                        <i class="fas ${icons[notification.type]}"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${notification.title}</div>
                        <div class="notification-message">${notification.message}</div>
                    </div>
                    <button class="notification-close" onclick="notifications.remove(${notification.id})">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                this.container.appendChild(notificationEl);
            }
            
            remove(id) {
                const notification = document.getElementById(`notification-${id}`);
                if (notification) {
                    notification.style.animation = 'slideOutLeft 0.4s forwards';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.remove();
                        }
                    }, 400);
                }
                this.notifications = this.notifications.filter(n => n.id !== id);
            }
        }

        // ============== بيانات المنتجات ==============
        const productsData = [
            {
                id: 1,
                name: "بدلة رجالية فاخرة",
                price: 899.99,
                oldPrice: 1299.99,
                rating: 4.8,
                badge: "الأكثر مبيعاً",
                category: "men",
                image: "images/1.png"
            },
            {
                id: 2,
                name: "فستان سهرة أنيق",
                price: 749.99,
                oldPrice: 999.99,
                rating: 4.9,
                badge: "جديد",
                category: "women",
                image: "images/2.png"
            },
            {
                id: 3,
                name: "جاكيت شتوي دافئ",
                price: 499.99,
                oldPrice: null,
                rating: 4.5,
                badge: "موسمي",
                category: "men",
                image: "images/3.png"
            },
            {
                id: 4,
                name: "حذاء رياضي نسائي",
                price: 349.99,
                oldPrice: 449.99,
                rating: 4.7,
                badge: "خصم",
                category: "women",
                image: "images/7.png"
            },
            {
                id: 5,
                name: "ملابس أطفال قطنية",
                price: 199.99,
                oldPrice: 249.99,
                rating: 4.6,
                badge: "الأفضل",
                category: "kids",
                image: "images/4.png"
            },
            {
                id: 6,
                name: "ساعة يد فاخرة",
                price: 1299.99,
                oldPrice: 1599.99,
                rating: 4.9,
                badge: "حصري",
                category: "accessories",
                image: "images/3.png"
            },
            {
                id: 7,
                name: "قميص رجالي رسمي",
                price: 299.99,
                oldPrice: 399.99,
                rating: 4.4,
                badge: "جديد",
                category: "men",
                image: "images/2.png"
            },
            {
                id: 8,
                name: "حقيبة يد نسائية",
                price: 599.99,
                oldPrice: 799.99,
                rating: 4.8,
                badge: "حصري",
                category: "accessories",
                image: "images/1.png"
            }
        ];

        // ============== تهيئة النظام ==============
        const store = new Store();
        const notifications = new NotificationSystem('notificationContainer');

        // ============== دوال العرض ==============
        function displayProducts(filter = 'all') {
            const productsContainer = document.getElementById('products-container');
            productsContainer.innerHTML = '';
            
            const filteredProducts = filter === 'all' 
                ? productsData 
                : productsData.filter(product => product.category === filter);
            
            filteredProducts.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.setAttribute('data-category', product.category);
                
                // إنشاء النجوم للتقييم
                let stars = '';
                const fullStars = Math.floor(product.rating);
                const hasHalfStar = product.rating % 1 !== 0;
                
                for (let i = 0; i < fullStars; i++) {
                    stars += '<i class="fas fa-star"></i>';
                }
                
                if (hasHalfStar) {
                    stars += '<i class="fas fa-star-half-alt"></i>';
                }
                
                const remainingStars = 5 - Math.ceil(product.rating);
                for (let i = 0; i < remainingStars; i++) {
                    stars += '<i class="far fa-star"></i>';
                }
                
                // التحقق من وجود المنتج في المفضلة
                const isInWishlist = store.state.wishlist.some(item => item.id === product.id);
                
                productCard.innerHTML = `
                    <div class="product-img">
                        <img src="${product.image}" alt="${product.name}">
                        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                        <div class="product-actions">
                            <button class="product-action-btn wishlist-btn" data-id="${product.id}">
                                <i class="fa${isInWishlist ? 's' : 'r'} fa-heart"></i>
                            </button>
                            <button class="product-action-btn quick-view-btn" data-id="${product.id}">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <div class="product-price">
                            <span class="current-price">${product.price.toFixed(2)} ج.م</span>
                            ${product.oldPrice ? `<span class="old-price">${product.oldPrice.toFixed(2)} ج.م</span>` : ''}
                        </div>
                        <div class="product-rating">
                            <div class="rating-stars">${stars}</div>
                            <span class="rating-count">(${product.rating})</span>
                        </div>
                        <button class="add-to-cart-btn" data-id="${product.id}">
                            <i class="fas fa-shopping-cart"></i> أضف إلى السلة
                        </button>
                    </div>
                `;
                
                productsContainer.appendChild(productCard);
            });
            
            // إضافة الأحداث للأزرار
            attachProductEvents();
        }

        function attachProductEvents() {
            // أزرار المفضلة
            document.querySelectorAll('.wishlist-btn').forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    const productId = parseInt(this.getAttribute('data-id'));
                    const product = productsData.find(p => p.id === productId);
                    
                    if (!store.state.isAuthenticated) {
                        notifications.show('يجب تسجيل الدخول أولاً لإضافة المنتجات إلى المفضلة', 'warning');
                        openAuthModal();
                        return;
                    }
                    
                    store.toggleWishlist(product);
                    const isInWishlist = store.state.wishlist.some(item => item.id === productId);
                    
                    // تحديث أيقونة المفضلة
                    const icon = this.querySelector('i');
                    icon.className = isInWishlist ? 'fas fa-heart' : 'far fa-heart';
                    
                    notifications.show(
                        isInWishlist ? 'تمت إضافة المنتج إلى المفضلة' : 'تمت إزالة المنتج من المفضلة',
                        'success'
                    );
                });
            });
            
            // أزرار العرض السريع
            document.querySelectorAll('.quick-view-btn').forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    const productId = parseInt(this.getAttribute('data-id'));
                    const product = productsData.find(p => p.id === productId);
                    
                    notifications.show(
                        `${product.name} - السعر: ${product.price} ج.م - التقييم: ${product.rating}/5`,
                        'info',
                        'عرض سريع'
                    );
                });
            });
            
            // أزرار إضافة إلى السلة
            document.querySelectorAll('.add-to-cart-btn').forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    const productId = parseInt(this.getAttribute('data-id'));
                    const product = productsData.find(p => p.id === productId);
                    
                    if (!store.state.isAuthenticated) {
                        notifications.show('يجب تسجيل الدخول أولاً لإضافة المنتجات إلى السلة', 'warning');
                        openAuthModal();
                        return;
                    }
                    
                    store.addToCart(product);
                    notifications.show(`تمت إضافة "${product.name}" إلى سلة التسوق`, 'success');
                });
            });
        }

        // ============== نظام تسجيل الدخول ==============
        function openAuthModal() {
            document.getElementById('authModal').classList.add('active');
        }

        function closeAuthModal() {
            document.getElementById('authModal').classList.remove('active');
        }

        function updateUserInterface() {
            const userInfo = document.getElementById('userInfo');
            const userName = document.getElementById('userName');
            const userBtn = document.getElementById('userBtn');
            
            if (store.state.isAuthenticated && store.state.user) {
                userBtn.style.display = 'none';
                userInfo.style.display = 'flex';
                userName.textContent = store.state.user.name || store.state.user.email;
            } else {
                userBtn.style.display = 'block';
                userInfo.style.display = 'none';
            }
            
            // تحديث عداد السلة
            updateCartCount();
        }

        function updateCartCount() {
            const cartCount = document.getElementById('cartCount');
            cartCount.textContent = store.getCartCount();
        }

        // ============== نظام السلة ==============
        function updateCartSidebar() {
            const cartItems = document.getElementById('cartItems');
            const cartTotal = document.getElementById('cartTotal');
            
            if (store.state.cart.length === 0) {
                cartItems.innerHTML = `
                    <div style="text-align: center; padding: 40px 0;">
                        <i class="fas fa-shopping-bag" style="font-size: 4rem; color: #ddd; margin-bottom: 20px;"></i>
                        <p style="color: var(--text-light);">سلة التسوق فارغة</p>
                    </div>
                `;
                cartTotal.textContent = '0 ج.م';
                return;
            }
            
            let html = '';
            store.state.cart.forEach(item => {
                html += `
                    <div class="cart-item" data-id="${item.id}">
                        <div class="cart-item-img">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="cart-item-details">
                            <div class="cart-item-title">${item.name}</div>
                            <div class="cart-item-price">${item.price} ج.م</div>
                            <div class="cart-item-quantity">
                                <button class="quantity-btn decrease-qty" data-id="${item.id}">-</button>
                                <span>${item.quantity}</span>
                                <button class="quantity-btn increase-qty" data-id="${item.id}">+</button>
                            </div>
                        </div>
                        <div class="cart-item-remove remove-from-cart" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </div>
                    </div>
                `;
            });
            
            cartItems.innerHTML = html;
            cartTotal.textContent = `${store.getCartTotal().toFixed(2)} ج.م`;
            
            // إضافة الأحداث
            document.querySelectorAll('.decrease-qty').forEach(btn => {
                btn.addEventListener('click', function() {
                    const productId = parseInt(this.getAttribute('data-id'));
                    const item = store.state.cart.find(item => item.id === productId);
                    if (item) {
                        store.updateCartItemQuantity(productId, item.quantity - 1);
                    }
                });
            });
            
            document.querySelectorAll('.increase-qty').forEach(btn => {
                btn.addEventListener('click', function() {
                    const productId = parseInt(this.getAttribute('data-id'));
                    const item = store.state.cart.find(item => item.id === productId);
                    if (item) {
                        store.updateCartItemQuantity(productId, item.quantity + 1);
                    }
                });
            });
            
            document.querySelectorAll('.remove-from-cart').forEach(btn => {
                btn.addEventListener('click', function() {
                    const productId = parseInt(this.getAttribute('data-id'));
                    store.removeFromCart(productId);
                    notifications.show('تمت إزالة المنتج من السلة', 'success');
                });
            });
        }

        // ============== الإعدادات والأحداث ==============
        document.addEventListener('DOMContentLoaded', function() {
            // إخفاء شاشة التحميل
            setTimeout(() => {
                document.getElementById('preloader').classList.add('hidden');
            }, 1000);
            
            // عرض المنتجات
            displayProducts();
            
            // تحديث واجهة المستخدم
            updateUserInterface();
            updateCartSidebar();
            
            // الاشتراك في تغييرات المتجر
            store.subscribe((state) => {
                updateUserInterface();
                updateCartSidebar();
                updateCartCount();
            });
            
            // ============== أحداث الأزرار ==============
   // زر المستخدم
            const userBtn = document.getElementById('userBtn');
            if (userBtn) {
                userBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('user btn clicked');
                    openAuthModal();
                });
            }
            
            // إغلاق نافذة تسجيل الدخول
            const closeAuth = document.getElementById('closeAuth');
            if (closeAuth) {
                closeAuth.addEventListener('click', function(e) {
                    e.preventDefault();
                    closeAuthModal();
                });
            }
            
            // إغلاق النافذة عند النقر خارجها
            const authModal = document.getElementById('authModal');
            if (authModal) {
                authModal.addEventListener('click', function(e) {
                    if (e.target === authModal) {
                        closeAuthModal();
                    }
                });
            }
            
            // تبديل التبويبات في نافذة تسجيل الدخول
            document.querySelectorAll('.auth-tab').forEach(tab => {
                tab.addEventListener('click', function() {
                    const tabName = this.getAttribute('data-tab');
                    
                    // تحديث التبويبات النشطة
                    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    
                    // تحديث النماذج
                    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
                    if (tabName === 'login') {
                        document.getElementById('loginForm').classList.add('active');
                    } else {
                        document.getElementById('registerForm').classList.add('active');
                    }
                });
            });
            
            // نموذج تسجيل الدخول
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const email = document.getElementById('loginEmail').value;
                    const password = document.getElementById('loginPassword').value;
                    
                    // التحقق من صحة البيانات
                    if (!email || !password) {
                        notifications.show('الرجاء إدخال البريد الإلكتروني وكلمة المرور', 'error');
                        return;
                    }
                    
                    // محاكاة تسجيل الدخول
                    const users = JSON.parse(localStorage.getItem('moda_users') || '[]');
                    const user = users.find(u => u.email === email && u.password === password);
                    
                    if (user) {
                        store.login({ name: user.name, email: user.email });
                        notifications.show('تم تسجيل الدخول بنجاح', 'success');
                        closeAuthModal();
                        
                        // مسح الحقول
                        document.getElementById('loginEmail').value = '';
                        document.getElementById('loginPassword').value = '';
                    } else {
                        notifications.show('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
                    }
                });
            }
            
            // نموذج إنشاء حساب
            const registerForm = document.getElementById('registerForm');
            if (registerForm) {
                registerForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const name = document.getElementById('registerName').value;
                    const email = document.getElementById('registerEmail').value;
                    const password = document.getElementById('registerPassword').value;
                    const confirmPassword = document.getElementById('registerConfirmPassword').value;
                    
                    // التحقق من صحة البيانات
                    if (!name || !email || !password || !confirmPassword) {
                        notifications.show('الرجاء ملء جميع الحقول', 'error');
                        return;
                    }
                    
                    if (password !== confirmPassword) {
                        notifications.show('كلمة المرور غير متطابقة', 'error');
                        return;
                    }
                    
                    if (password.length < 6) {
                        notifications.show('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
                        return;
                    }
                    
                    // حفظ المستخدم
                    const users = JSON.parse(localStorage.getItem('moda_users') || '[]');
                    
                    if (users.some(u => u.email === email)) {
                        notifications.show('البريد الإلكتروني مستخدم بالفعل', 'error');
                        return;
                    }
                    
                    const newUser = { name, email, password };
                    users.push(newUser);
                    localStorage.setItem('moda_users', JSON.stringify(users));
                    
                    store.login(newUser);
                    notifications.show('تم إنشاء الحساب بنجاح', 'success');
                    closeAuthModal();
                    
                    // مسح الحقول
                    document.getElementById('registerName').value = '';
                    document.getElementById('registerEmail').value = '';
                    document.getElementById('registerPassword').value = '';
                    document.getElementById('registerConfirmPassword').value = '';
                });
            }
            
            
            // زر السلة
            document.getElementById('cartBtn').addEventListener('click', function() {
                if (!store.state.isAuthenticated) {
                    notifications.show('يجب تسجيل الدخول أولاً', 'warning');
                    openAuthModal();
                    return;
                }
                document.getElementById('cartSidebar').classList.add('active');
            });
            
            // إغلاق السلة
            document.getElementById('closeCart').addEventListener('click', function() {
                document.getElementById('cartSidebar').classList.remove('active');
            });
            
            // زر إتمام الشراء
            document.getElementById('checkoutBtn').addEventListener('click', function() {
                if (store.state.cart.length === 0) {
                    notifications.show('السلة فارغة', 'warning');
                    return;
                }
                
                notifications.show('تم إتمام الطلب بنجاح! شكراً لتسوقك مع مودا', 'success');
                store.state.cart = [];
                store.saveToStorage();
                store.notify();
                document.getElementById('cartSidebar').classList.remove('active');
            });
            
            // القائمة المتنقلة
            const mobileMenuBtn = document.getElementById('mobile-menu-btn');
            const navMenu = document.getElementById('nav-menu');
            const overlay = document.getElementById('overlay');
            
            mobileMenuBtn.addEventListener('click', function() {
                navMenu.classList.toggle('active');
                overlay.classList.toggle('active');
                this.querySelector('i').className = navMenu.classList.contains('active') 
                    ? 'fas fa-times' 
                    : 'fas fa-bars';
            });
            
            overlay.addEventListener('click', function() {
                navMenu.classList.remove('active');
                overlay.classList.remove('active');
                mobileMenuBtn.querySelector('i').className = 'fas fa-bars';
            });
            
            // إغلاق القائمة عند النقر على رابط
            document.querySelectorAll('#nav-menu a').forEach(link => {
                link.addEventListener('click', function() {
                    navMenu.classList.remove('active');
                    overlay.classList.remove('active');
                    mobileMenuBtn.querySelector('i').className = 'fas fa-bars';
                });
            });
            
            // تصفية المنتجات
            document.querySelectorAll('.filter-btn').forEach(button => {
                button.addEventListener('click', function() {
                    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    
                    const filter = this.getAttribute('data-filter');
                    displayProducts(filter);
                });
            });
            
            // النقر على الفئات
            document.querySelectorAll('.category-card').forEach(card => {
                card.addEventListener('click', function() {
                    const category = this.getAttribute('data-category');
                    
                    // تحديث زر التصفية
                    document.querySelectorAll('.filter-btn').forEach(btn => {
                        btn.classList.remove('active');
                        if (btn.getAttribute('data-filter') === category) {
                            btn.classList.add('active');
                        }
                    });
                    
                    // عرض المنتجات المصنفة
                    displayProducts(category);
                    
                    // التمرير إلى قسم المنتجات
                    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
                });
            });
            
            // نموذج النشرة البريدية
            document.getElementById('newsletterForm').addEventListener('submit', function(e) {
                e.preventDefault();
                const email = this.querySelector('input[type="email"]').value;
                notifications.show(`شكراً على اشتراكك في النشرة البريدية: ${email}`, 'success');
                this.reset();
            });
            
            // زر تسجيل الخروج
            document.getElementById('userInfo').addEventListener('click', function() {
                if (confirm('هل تريد تسجيل الخروج؟')) {
                    store.logout();
                    notifications.show('تم تسجيل الخروج بنجاح', 'info');
                }
            });
            
            // العد التنازلي
            startCountdown();
            
            // تأثير التمرير السلس
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const targetId = this.getAttribute('href');
                    if (targetId === '#') return;
                    
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 100,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        });

        // دالة العد التنازلي
        function startCountdown() {
            const countdownDate = new Date();
            countdownDate.setDate(countdownDate.getDate() + 15);
            
            function updateCountdown() {
                const now = new Date().getTime();
                const distance = countdownDate - now;
                
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                
                document.getElementById('days').textContent = days.toString().padStart(2, '0');
                document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
                document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
                document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
                
                if (distance < 0) {
                    clearInterval(countdownInterval);
                    document.querySelector('.countdown').innerHTML = "<h3 style='color: var(--primary-gold)'>انتهى العرض!</h3>";
                }
            }
            
            updateCountdown();
            const countdownInterval = setInterval(updateCountdown, 1000);
        }

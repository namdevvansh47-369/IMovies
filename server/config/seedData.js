const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { generateSeatLayout } = require('../controllers/showController');

const seedDatabase = async () => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('[Seed] Database already contains records. Skipping seed.');
      return;
    }

    console.log('[Seed] Seeding initial IMovies cinema data...');

    // 1. Create Admin & Demo Users
    const adminUser = await User.create({
      name: 'IMovies Admin',
      email: 'admin@imovies.com',
      password: 'admin123',
      phone: '+1 987-654-3210',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    });

    const demoUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      phone: '+1 555-0199-281',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    });

    // 2. Create Movies
    const moviesData = [
      {
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
        poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
        banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        genre: ['Sci-Fi', 'Adventure', 'Action'],
        language: ['English', 'Hindi'],
        duration: 166,
        releaseDate: new Date('2024-03-01'),
        rating: 8.9,
        votesCount: 38500,
        director: 'Denis Villeneuve',
        cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Austin Butler'],
        certificate: 'UA',
        status: 'now_showing',
        isFeatured: true
      },
      {
        title: 'Oppenheimer',
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
        poster: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
        banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
        genre: ['Biography', 'Drama', 'History'],
        language: ['English', 'Hindi'],
        duration: 180,
        releaseDate: new Date('2023-07-21'),
        rating: 8.9,
        votesCount: 45200,
        director: 'Christopher Nolan',
        cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
        certificate: 'UA',
        status: 'now_showing',
        isFeatured: true
      },
      {
        title: 'Spider-Man: Across the Spider-Verse',
        description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
        poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80',
        banner: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
        genre: ['Animation', 'Action', 'Adventure'],
        language: ['English', 'Hindi', 'Spanish'],
        duration: 140,
        releaseDate: new Date('2023-06-02'),
        rating: 8.7,
        votesCount: 32900,
        director: 'Joaquim Dos Santos',
        cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac'],
        certificate: 'U',
        status: 'now_showing',
        isFeatured: true
      },
      {
        title: 'Interstellar',
        description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers.',
        poster: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80',
        banner: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        genre: ['Sci-Fi', 'Drama', 'Adventure'],
        language: ['English'],
        duration: 169,
        releaseDate: new Date('2014-11-07'),
        rating: 8.7,
        votesCount: 71000,
        director: 'Christopher Nolan',
        cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
        certificate: 'UA',
        status: 'now_showing',
        isFeatured: false
      },
      {
        title: 'The Dark Knight',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
        poster: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=600&q=80',
        banner: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
        genre: ['Action', 'Crime', 'Drama'],
        language: ['English', 'Hindi'],
        duration: 152,
        releaseDate: new Date('2008-07-18'),
        rating: 9.0,
        votesCount: 98000,
        director: 'Christopher Nolan',
        cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
        certificate: 'UA',
        status: 'now_showing',
        isFeatured: false
      },
      {
        title: 'Avatar: Fire and Ash',
        description: 'The upcoming epic adventure continuing the journey of Jake Sully and Neytiri across uncharted regions of Pandora.',
        poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
        banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
        genre: ['Sci-Fi', 'Action', 'Adventure'],
        language: ['English', 'Hindi'],
        duration: 190,
        releaseDate: new Date('2025-12-19'),
        rating: 9.2,
        votesCount: 5200,
        director: 'James Cameron',
        cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver'],
        certificate: 'UA',
        status: 'coming_soon',
        isFeatured: false
      }
    ];

    const movies = await Movie.insertMany(moviesData);

    // 3. Create Theatres
    const theatresData = [
      {
        name: 'PVR IMAX Phoenix Palladium',
        city: 'Mumbai',
        location: 'Lower Parel',
        address: '462, Senapati Bapat Marg, Lower Parel, Mumbai, Maharashtra 400013',
        screens: [
          { name: 'IMAX Screen 1', displayType: 'IMAX Laser 4K', soundSystem: 'Dolby Atmos 12.1', rows: 8, cols: 12, totalSeats: 96 },
          { name: 'Audi 2 (4DX)', displayType: '4DX Motion', soundSystem: 'Dolby 7.1', rows: 6, cols: 10, totalSeats: 60 }
        ],
        amenities: ['IMAX Laser', '4DX Motion', 'Recliner Seats', 'Gourmet Cafe', 'Valet Parking']
      },
      {
        name: 'INOX Megaplex Inorbit Mall',
        city: 'Mumbai',
        location: 'Malad West',
        address: 'New Link Rd, Malad, Mumbai, Maharashtra 400064',
        screens: [
          { name: 'Screen 1 (Laser)', displayType: 'Barco 4K Laser', soundSystem: 'Dolby Atmos', rows: 8, cols: 12, totalSeats: 96 }
        ],
        amenities: ['Dolby Atmos', 'In-Seat Dining', 'Wheelchair Access', 'Covered Parking']
      },
      {
        name: 'PVR Director’s Cut Ambience Mall',
        city: 'Delhi',
        location: 'Vasant Kunj',
        address: 'Nelson Mandela Marg, Vasant Kunj II, New Delhi 110070',
        screens: [
          { name: 'Luxury Audi 1', displayType: 'Laser 4K', soundSystem: 'Meyer Sound Dolby Atmos', rows: 8, cols: 12, totalSeats: 96 }
        ],
        amenities: ['Ultra Luxury Loungers', 'Chef Curated Menu', 'Butler Service', 'VIP Lounge']
      },
      {
        name: 'Cinepolis Forum South Bangalore',
        city: 'Bangalore',
        location: 'Kanakapura Road',
        address: 'Forum Mall, Konanakunte, Bengaluru, Karnataka 560062',
        screens: [
          { name: 'Screen 1 (IMAX)', displayType: 'IMAX with Laser', soundSystem: 'IMAX 12-Channel', rows: 8, cols: 12, totalSeats: 96 }
        ],
        amenities: ['IMAX Laser', 'Dolby Atmos', 'Recliners', 'Coffee Bar']
      }
    ];

    const theatres = await Theatre.insertMany(theatresData);

    // 4. Create Shows for Today and Upcoming Days
    const showTimes = [
      { hours: 10, minutes: 30, format: '2D' },
      { hours: 14, minutes: 15, format: '3D' },
      { hours: 18, minutes: 45, format: 'IMAX 3D' },
      { hours: 22, minutes: 0, format: 'Dolby Cinema' }
    ];

    const showsToInsert = [];

    // Schedule shows for active movies across theatres
    const activeMovies = movies.filter((m) => m.status === 'now_showing');

    for (let dayOffset = 0; dayOffset <= 2; dayOffset++) {
      for (const theatre of theatres) {
        for (let mIdx = 0; mIdx < Math.min(activeMovies.length, 3); mIdx++) {
          const movie = activeMovies[(mIdx + dayOffset) % activeMovies.length];
          const st = showTimes[(mIdx + dayOffset) % showTimes.length];

          const showDate = new Date();
          showDate.setDate(showDate.getDate() + dayOffset);
          showDate.setHours(st.hours, st.minutes, 0, 0);

          const seats = generateSeatLayout(8, 12, { silver: 220, gold: 350, platinum: 500 });

          // Pre-book a couple of sample seats so it looks authentic
          if (seats.length > 5) {
            seats[10].status = 'booked';
            seats[10].bookedBy = demoUser._id;
            seats[11].status = 'booked';
            seats[11].bookedBy = demoUser._id;
          }

          showsToInsert.push({
            movie: movie._id,
            theatre: theatre._id,
            screenName: theatre.screens[0]?.name || 'Audi 1',
            showDateTime: showDate,
            format: st.format,
            language: movie.language[0] || 'English',
            priceTiers: { silver: 220, gold: 350, platinum: 500 },
            seats,
            totalSeats: seats.length,
            availableSeatsCount: seats.filter((s) => s.status === 'available').length,
            status: 'scheduled'
          });
        }
      }
    }

    const createdShows = await Show.insertMany(showsToInsert);

    // 5. Create initial sample booking for demo user
    if (createdShows.length > 0) {
      const sampleShow = createdShows[0];
      const bookedSeats = [
        { seatNumber: 'B11', row: 'B', col: 11, tier: 'silver', price: 220 },
        { seatNumber: 'B12', row: 'B', col: 12, tier: 'silver', price: 220 }
      ];
      const subtotal = 440;
      const convenienceFee = 40;
      const taxAmount = 86;
      const totalAmount = subtotal + convenienceFee + taxAmount;

      const sampleBooking = await Booking.create({
        bookingId: 'IMV-20261028-DEMO1',
        user: demoUser._id,
        show: sampleShow._id,
        movie: sampleShow.movie,
        theatre: sampleShow.theatre,
        seats: bookedSeats,
        subtotal,
        convenienceFee,
        taxAmount,
        totalAmount,
        paymentStatus: 'paid',
        paymentMethod: 'card',
        transactionId: 'TXN-DEMO-982148',
        bookingStatus: 'confirmed'
      });

      await Payment.create({
        booking: sampleBooking._id,
        user: demoUser._id,
        amount: totalAmount,
        currency: 'INR',
        paymentMethod: 'card',
        transactionId: 'TXN-DEMO-982148',
        status: 'success'
      });

      await Notification.create({
        user: demoUser._id,
        title: 'Welcome to IMovies!',
        message: 'Your account is ready. Discover top trending movies and book cinema tickets with live seat selection.',
        type: 'system'
      });
    }

    console.log('[Seed] Database successfully seeded with movies, theatres, shows, and users!');
  } catch (err) {
    console.error('[Seed Error] Failed to seed database:', err);
  }
};

module.exports = { seedDatabase };

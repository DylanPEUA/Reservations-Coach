const pool = require('../src/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedDatabase = async () => {
    let connection;
    try {
        console.log('Démarrage du seed de la base de données ...');
        connection = await pool.getConnection();

        // Vider les données existantes (odre important pour les FK)
        console.log ('Suppression des données existantes ...');
        await connection.query('DELETE FROM reservations');
        await connection.query('DELETE FROM availabilities');
        await connection.query('DELETE FROM clients');
        await connection.query('DELETE FROM coaches');
        await connection.query('DELETE FROM users');

        // Hash des passwords
        const hashedPassword1 = await bcrypt.hash('password123', 10);
        const hashedPassword2 = await bcrypt.hash('password456', 10);
        const hashedPassword3 = await bcrypt.hash('password789', 10);
        const hashedPassword4 = await bcrypt.hash('coachpass', 10);
        const hashedPassword5 = await bcrypt.hash('coachpass2', 10);

        // (1) Créer les utilisateurs CLIENTS
        console.log('Création des clients...');
        const clientsData = [
            {
                email: 'client1@example.com',
                password: hashedPassword1,
                role: 'client',
                first_name: 'Alice',
                last_name: 'Martin',
            },
            {
                email: 'client2@example.com',
                password: hashedPassword2,
                role: 'client',
                first_name: 'Bob',
                last_name: 'Smith',
            },
            {
                email: 'client3@example.com',
                password: hashedPassword3,
                role: 'client',
                first_name: 'Charles',
                last_name: 'Bernard',
            },
        ];

        const clientUserIds = [];
        for (const client of clientsData) {
            const [result] = await connection.query(
                'INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
                [client.email, client.password, client.role, client.first_name, client.last_name]
            );
            clientUserIds.push(result.insertId);
        }

        // (2) Créer les utilisateurs COACHES
        console.log("Création des coaches...");
        const coachesData = [
            {
                email: 'coach1@example.com',
                password_hash: hashedPassword4,
                role: 'coach',
                first_name: 'Marc',
                last_name: 'Fitness',
            },
            {
                email: 'coach2@example.com',
                password_hash: hashedPassword5,
                role: 'coach',
                first_name: 'Sophie',
                last_name: 'Sport',
            },
        ];

        const coachUserIds = [];
        for (const coach of coachesData) {
            const [result] = await connection.query(
                'INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
                [coach.email, coach.password_hash, coach.role, coach.first_name, coach.last_name]
            );
            coachUserIds.push(result.insertId);
        }

        // (3) Créer les profiles CLIENTS
        console.log("Création des profils clients...");
        for (const userId of clientUserIds) {
            await connection.query(
                'INSERT INTO clients (user_id, phone, address) VALUES (?, ?, ?)',
                [userId, '06' + Math.random().toString().slice(2, 11), '123 Rue Exemple, Paris']
            );
        }

        // (4) Créer les profiles COACHES
        console.log("Création des profils coaches...");
        const coachProfiles = [
            {
                bio: 'Coach sportif spécialisé en fitness et musculation.',
                specialization: 'Fitness, Musculation',
                hourly_rate: 50.00,
            },
            {
                bio: 'Coach en yoga et bien-être.',
                specialization: 'Yoga, Bien-être',
                hourly_rate: 40.00,
            },
        ];

        const coachIds = [];
        for (let i = 0; i < coachUserIds.length; i++) {
            const [result] = await connection.query(
                'INSERT INTO coaches (user_id, bio, specialization, hourly_rate) VALUES (?, ?, ?, ?)',
                [coachUserIds[i], coachProfiles[i].bio, coachProfiles[i].specialization, coachProfiles[i].hourly_rate]
            );
            coachIds.push(result.insertId);
        }

        // (5) Créer les disponibilités
        console.log("Création des disponibilités...");
        const availabilities = [
            // Coach 1 - Lundi(1), Mercredi(3), Vendredi(5) de 9h à 11h, 14h à 16h et 10h à 12h
            { coach_id: coachIds[0], day_of_week: 1, start_time: '09:00:00', end_time: '11:00:00', duration_minutes: 60 },
            { coach_id: coachIds[0], day_of_week: 3, start_time: '14:00:00', end_time: '16:00:00', duration_minutes: 60 },
            { coach_id: coachIds[0], day_of_week: 5, start_time: '10:00:00', end_time: '12:00:00', duration_minutes: 60 },
            // Coach 2 - Mardi(2), Jeudi (4) et Samedi(6) de 8h à 10h, 17h à 19h et 10h à 14h
            { coach_id: coachIds[1], day_of_week: 2, start_time: '08:00:00', end_time: '10:00:00', duration_minutes: 60 },
            { coach_id: coachIds[1], day_of_week: 4, start_time: '17:00:00', end_time: '19:00:00', duration_minutes: 60 },
            { coach_id: coachIds[1], day_of_week: 6, start_time: '10:00:00', end_time: '14:00:00', duration_minutes: 60 },
        ];

        const availabilityIds = [];
        for (const avail of availabilities) {
            const [result] = await connection.query(
                'INSERT INTO availabilities (coach_id, day_of_week, start_time, end_time, duration_minutes) VALUES (?, ?, ?, ?, ?)',
                [avail.coach_id, avail.day_of_week, avail.start_time, avail.end_time, avail.duration_minutes]
            );
            availabilityIds.push(result.insertId);
        }

        // (6) Créer des réservations
        console.log("Création des réservations...");
        const reservations = [
            {
                client_id: clientUserIds[0],
                coach_id: coachIds[0],
                availability_id: availabilityIds[0],
                scheduled_at: getNextDayTime(1, '09:00'),
                status: 'confirmed',
            },
            {
                client_id: clientUserIds[1],
                coach_id: coachIds[0],
                availability_id: availabilityIds[0],
                scheduled_at: getNextDayTime(1, '10:00'),
                status: 'confirmed',
            },
            {
                client_id: clientUserIds[2],
                coach_id: coachIds[1],
                availability_id: availabilityIds[3],
                scheduled_at: getNextDayTime(2, '08:00'),
                status: 'pending',
            },
        ];

        for (const reservation of reservations) {
            await connection.query(
                'INSERT INTO reservations (client_id, coach_id, availability_id, scheduled_at, status) VALUES (?, ?, ?, ?, ?)',
                [reservation.client_id, reservation.coach_id, reservation.availability_id, reservation.scheduled_at, reservation.status]
            );
        }

        // Compter les données créées
        const [clientsCountResult] = await connection.query('SELECT COUNT(*) as count FROM clients');
        const [coachsCountResult] = await connection.query('SELECT COUNT(*) as count FROM coaches');
        const [availabilitiesCountResult] = await connection.query('SELECT COUNT(*) as count FROM availabilities');
        const [reservationsCountResult] = await connection.query('SELECT COUNT(*) as count FROM reservations');

        const clientsCount = clientsCountResult[0].count;
        const coachsCount = coachsCountResult[0].count;
        const availabilitiesCount = availabilitiesCountResult[0].count;
        const reservationsCount = reservationsCountResult[0].count;

        console.log('✨ Seed complété avec succès !');
        console.log('\n📊 Données créées :');
        console.log(`   - ${clientsCount} clients`);
        console.log(`   - ${coachsCount} coachs`);
        console.log(`   - ${availabilitiesCount} disponibilités`);
        console.log(`   - ${reservationsCount} réservations`);
        console.log('\n🔐 Identifiants de test :');
        console.log('   Client: client1@example.com / password123');
        console.log('   Coach: coach1@example.com / coachpass');

        process.exit(0);
    } catch (error) {
        console.error('Erreur lors du seed:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
        await pool.end();
    }
};

// Fonction utilitaire pour calculer le prochain jour à une heure donnée
function getNextDayTime(dayOfWeek, time) {
    const now = new Date();
    const dayDiff = (dayOfWeek - now.getDay() + 7) % 7;
    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + (dayDiff || 7));

    const [hours, minutes] = time.split(':');
    nextDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    return nextDate.toISOString().slice(0,19).replace('T',' ');
}

seedDatabase();
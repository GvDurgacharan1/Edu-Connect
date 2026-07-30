import './config/firebase.js';
import dotenv from 'dotenv';

// Load models
import User from './models/User.js';
import Student from './models/Student.js';
import Teacher from './models/Teacher.js';
import Course from './models/Course.js';
import Post from './models/Post.js';
import Role from './models/Role.js';

// Load environment variables
dotenv.config();

const seedDB = async () => {
  try {
    console.log('Seeding using Firebase connector...');

    // Clear existing data
    console.log('Clearing existing database collections...');
    await User.deleteMany();
    await Student.deleteMany();
    await Teacher.deleteMany();
    await Course.deleteMany();
    await Post.deleteMany();
    await Role.deleteMany();

    // 1. Seed Roles
    console.log('Seeding system roles...');
    await Role.create({ name: 'admin', permissions: ['all'] });
    await Role.create({ name: 'teacher', permissions: ['create_course', 'create_post', 'schedule_meeting'] });
    await Role.create({ name: 'student', permissions: ['search_teachers', 'book_meeting', 'read_courses'] });

    // 2. Create Admin Account
    console.log('Creating Admin account...');
    await User.create({
      username: 'admin',
      email: 'admin@educonnect.com',
      password: 'admin123',
      role: 'admin',
      status: 'active'
    });

    // 3. Create Student Account & Profile
    console.log('Creating Student account & profile...');
    const studentUser = await User.create({
      username: 'student',
      email: 'student@educonnect.com',
      password: 'student123',
      role: 'student',
      status: 'active'
    });
    
    await Student.create({
      user: studentUser._id,
      fullName: 'Jane Smith',
      avatar: '',
      age: 21,
      gender: 'Female',
      phone: '1234567890',
      university: 'Massachusetts Institute of Technology',
      college: 'School of Engineering',
      department: 'Computer Science & Engineering',
      branch: 'Software Systems',
      course: 'B.S. Computer Science',
      year: '3rd Year',
      semester: '6th Semester',
      skills: ['React.js', 'Tailwind CSS', 'Node.js', 'Git'],
      interests: ['Distributed Systems', 'Artificial Intelligence', 'Open Source'],
      careerGoal: 'Become a Distributed Systems Lead Architect.',
      biography: 'Undergrad student specializing in cloud infrastructures and distributed key-value stores. Looking for mentorship in database Normalization and consensus algorithms.',
      location: 'Boston, MA, USA'
    });

    // 4. Create Teacher Account & Profile
    console.log('Creating Teacher account & profile...');
    const teacherUser = await User.create({
      username: 'teacher',
      email: 'teacher@educonnect.com',
      password: 'teacher123',
      role: 'teacher',
      status: 'active'
    });

    const teacherProfile = await Teacher.create({
      user: teacherUser._id,
      fullName: 'Dr. John Doe',
      avatar: '',
      age: 44,
      gender: 'Male',
      phone: '9876543210',
      qualification: 'Ph.D. in Computer Science',
      currentPosition: 'Tenured Professor of Computer Science',
      university: 'Harvard University',
      experience: 12,
      subjects: ['Database Management Systems', 'Algorithms design', 'Cloud Architectures'],
      skills: ['Distributed Systems', 'Go Programming', 'SQL Optimization', 'Kubernetes'],
      languages: ['English', 'German'],
      biography: 'Experienced university professor conducting research in large-scale database replication, transactional consensus, and cloud virtualization structures. Author of over 30 academic publications.',
      teachingStyle: 'Hands-on programming assignments, board math proof reviews, and custom mentorship check-ins.',
      fees: 60,
      availableDays: ['Monday', 'Wednesday', 'Friday'],
      availableTime: '09:00 - 17:00',
      linkedin: 'https://linkedin.com/in/johndoe',
      website: 'https://scholar.google.com/johndoe',
      location: 'Cambridge, MA, USA',
      rating: 5.0,
      reviewsCount: 1
    });

    // 5. Create Courses
    console.log('Creating courses...');
    await Course.create({
      teacher: teacherProfile._id,
      title: 'Database Relational Normalization & SQL Tuning',
      subject: 'Computer Science',
      description: 'An advanced course focusing on Functional Dependencies, 1NF to BCNF decompositions, query optimizer mechanics, and index optimizations.',
      duration: '6 Weeks',
      sessionsCount: 12,
      fee: 150,
      prerequisites: ['Basic SQL SELECT queries', 'Discrete Mathematics basics'],
      maxStudents: 30,
      difficultyLevel: 'Intermediate',
      thumbnail: '',
      studyMaterials: [],
      isPublished: true
    });

    await Course.create({
      teacher: teacherProfile._id,
      title: 'Distributed Consensus & Raft Implementations',
      subject: 'Distributed Systems',
      description: 'Focuses on State Machine Replications, Paxos limitations, Raft leader election details, log replication boundaries, cluster membership changes, and debugging asynchronous race states in Go.',
      duration: '8 Weeks',
      sessionsCount: 16,
      fee: 250,
      prerequisites: ['Go programming language expertise', 'Concurrency primitives (mutexes, select channels)'],
      maxStudents: 15,
      difficultyLevel: 'Advanced',
      thumbnail: '',
      studyMaterials: [],
      isPublished: true
    });

    // 6. Create Educational Posts
    console.log('Creating posts...');
    await Post.create({
      teacher: teacherProfile._id,
      title: 'Functional Dependencies Normal Forms Cheat Sheet',
      description: 'Here is a quick cheat sheet summarizing constraints for BCNF (LHS must be a Super Key) and 3NF (RHS must be prime or LHS is Super Key). Great for midterms preparation!',
      postType: 'Notes',
      images: [],
      pdfFiles: [],
      likes: [studentUser._id],
      bookmarks: [studentUser._id]
    });

    await Post.create({
      teacher: teacherProfile._id,
      title: 'Assignment 2: Raft Leader Election State Machine released',
      description: 'Homework assignment 2 is released. Check classroom files for specifications. Deadline is August 15th. We will discuss race conditions during the Monday meeting.',
      postType: 'Assignment',
      images: [],
      pdfFiles: []
    });

    console.log('Database seeding successfully completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDB();

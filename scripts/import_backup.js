const fs = require('fs');
const path = require('path');

// Mock function to simulate DB insertion
const insertIntoDb = async (table, data) => {
  console.log(`[DB] Inserting into ${table}:`, data.length, 'records');
  // In a real scenario, this would use pg or prisma
  return true;
};

const importBackup = async () => {
  const filePath = path.join(__dirname, '../mnt/data/cpa_manager_backup_2025-11-21 (1).json');
  
  try {
    if (!fs.existsSync(filePath)) {
      console.error('Backup file not found at:', filePath);
      return;
    }

    const rawData = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(rawData);

    console.log('Starting import...');
    console.log('User ID:', jsonData.userId);
    console.log('Exported At:', jsonData.exportedAt);

    // 1. Simulate User Update (Ensure user exists)
    await insertIntoDb('users', [{ id: jsonData.userId, updated_at: new Date() }]);

    // 2. Import Cycles
    if (jsonData.cycles && Array.isArray(jsonData.cycles)) {
      const cyclesPayload = jsonData.cycles.map(c => ({
        id: c.id,
        user_id: jsonData.userId,
        date: c.date,
        deposit: c.deposit,
        withdrawal: c.withdrawal,
        chest: c.chest,
        profit: c.profit,
        platform: c.platform,
        notes: c.notes,
        created_at: new Date(c.createdAt)
      }));
      await insertIntoDb('cycles', cyclesPayload);
    }

    // 3. Import Settings
    if (jsonData.settings) {
      await insertIntoDb('user_settings', [{ 
        user_id: jsonData.userId, 
        monthly_goal: jsonData.settings.monthlyGoal 
      }]);
    }

    console.log('✅ Import completed successfully.');

  } catch (error) {
    console.error('❌ Import failed:', error);
  }
};

importBackup();

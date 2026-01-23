// Table Service - Mock implementation for table management

export interface Table {
    id: string;
    tableNumber: string;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved' | 'cleaning';
    location: string;
    currentOrder?: string;
    reservedBy?: string;
    reservedUntil?: string;
}

export interface TableStats {
    totalTables: number;
    availableTables: number;
    occupiedTables: number;
    reservedTables: number;
}

// Mock data
let tables: Table[] = [
    {
        id: 'T001',
        tableNumber: 'T-1',
        capacity: 2,
        status: 'available',
        location: 'Main Hall',
    },
    {
        id: 'T002',
        tableNumber: 'T-2',
        capacity: 4,
        status: 'occupied',
        location: 'Main Hall',
        currentOrder: 'ORD-001',
    },
    {
        id: 'T003',
        tableNumber: 'T-3',
        capacity: 4,
        status: 'available',
        location: 'Main Hall',
    },
    {
        id: 'T004',
        tableNumber: 'T-4',
        capacity: 6,
        status: 'reserved',
        location: 'VIP Section',
        reservedBy: 'John Doe',
        reservedUntil: new Date(Date.now() + 3600000).toISOString(),
    },
    {
        id: 'T005',
        tableNumber: 'T-5',
        capacity: 2,
        status: 'occupied',
        location: 'Outdoor',
        currentOrder: 'ORD-002',
    },
    {
        id: 'T006',
        tableNumber: 'T-6',
        capacity: 8,
        status: 'available',
        location: 'VIP Section',
    },
    {
        id: 'T007',
        tableNumber: 'T-7',
        capacity: 4,
        status: 'cleaning',
        location: 'Main Hall',
    },
    {
        id: 'T008',
        tableNumber: 'T-8',
        capacity: 2,
        status: 'available',
        location: 'Outdoor',
    },
];

export const fetchTables = async (): Promise<Table[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return tables;
};

export const fetchTableStats = async (): Promise<TableStats> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
        totalTables: tables.length,
        availableTables: tables.filter(t => t.status === 'available').length,
        occupiedTables: tables.filter(t => t.status === 'occupied').length,
        reservedTables: tables.filter(t => t.status === 'reserved').length,
    };
};

export const createTable = async (table: Omit<Table, 'id'>): Promise<Table> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newTable: Table = {
        ...table,
        id: `T${String(tables.length + 1).padStart(3, '0')}`,
    };
    tables.push(newTable);
    return newTable;
};

export const updateTable = async (id: string, updates: Partial<Table>): Promise<Table> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = tables.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Table not found');
    tables[index] = { ...tables[index], ...updates };
    return tables[index];
};

export const deleteTable = async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    tables = tables.filter(t => t.id !== id);
};

export const updateTableStatus = async (
    id: string,
    status: Table['status']
): Promise<Table> => {
    return updateTable(id, { status });
};

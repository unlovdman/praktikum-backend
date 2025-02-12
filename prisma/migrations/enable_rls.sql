-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Period" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Praktikum" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Kelompok" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Asistensi" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Laporan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Nilai" ENABLE ROW LEVEL SECURITY;

-- Create policies for User table
CREATE POLICY "Users can view their own data" ON "User"
    FOR SELECT
    USING (auth.uid()::text = id);

-- Create policies for Period table
CREATE POLICY "Anyone can view periods" ON "Period"
    FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Only admins can modify periods" ON "Period"
    USING (EXISTS (
        SELECT 1 FROM "User"
        WHERE id = auth.uid()::text
        AND role = 'ADMIN'
    ));

-- Create policies for Praktikum table
CREATE POLICY "Anyone can view praktikum" ON "Praktikum"
    FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Only admins can modify praktikum" ON "Praktikum"
    USING (EXISTS (
        SELECT 1 FROM "User"
        WHERE id = auth.uid()::text
        AND role = 'ADMIN'
    ));

-- Create policies for Kelompok table
CREATE POLICY "Users can view their groups" ON "Kelompok"
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM "User"
        WHERE id = auth.uid()::text
        AND "User".kelompokId = "Kelompok".id
    ));

-- Create policies for Asistensi table
CREATE POLICY "Users can view their own asistensi" ON "Asistensi"
    FOR SELECT
    USING (userId = auth.uid()::text);

CREATE POLICY "Asisten and admins can modify asistensi" ON "Asistensi"
    USING (EXISTS (
        SELECT 1 FROM "User"
        WHERE id = auth.uid()::text
        AND (role = 'ADMIN' OR role = 'ASISTEN_LAB')
    ));

-- Create policies for Laporan table
CREATE POLICY "Users can view their own laporan" ON "Laporan"
    FOR SELECT
    USING (userId = auth.uid()::text);

CREATE POLICY "Users can submit their own laporan" ON "Laporan"
    FOR INSERT
    WITH CHECK (userId = auth.uid()::text);

-- Create policies for Nilai table
CREATE POLICY "Users can view their own nilai" ON "Nilai"
    FOR SELECT
    USING (userId = auth.uid()::text);

CREATE POLICY "Asisten and admins can modify nilai" ON "Nilai"
    USING (EXISTS (
        SELECT 1 FROM "User"
        WHERE id = auth.uid()::text
        AND (role = 'ADMIN' OR role = 'ASISTEN_LAB')
    )); 
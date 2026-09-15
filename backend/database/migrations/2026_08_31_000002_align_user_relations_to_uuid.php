<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        $this->convertirAUuid('sessions', 'user_id');
        $this->convertirAUuid('personal_access_tokens', 'tokenable_id');
        $this->convertirAUuid('model_has_roles', 'model_id');
        $this->convertirAUuid('model_has_permissions', 'model_id');
        DB::statement('ALTER TABLE users ALTER COLUMN rol DROP NOT NULL');
    }

    public function down(): void
    {
    }

    private function convertirAUuid(string $tabla, string $columna): void
    {
        $tipo = DB::table('information_schema.columns')
            ->where('table_schema', 'public')
            ->where('table_name', $tabla)
            ->where('column_name', $columna)
            ->value('data_type');

        if ($tipo && $tipo !== 'uuid') {
            DB::statement("ALTER TABLE \"{$tabla}\" ALTER COLUMN \"{$columna}\" TYPE uuid USING lpad(to_hex(\"{$columna}\"), 32, '0')::uuid");
        }
    }
};
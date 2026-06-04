<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Illuminate\Console\Command;

class GenerateTenantKey extends Command
{
    protected $signature = 'tenant:generate {name}';
    protected $description = 'Cria um novo Tenant e gera uma chave de API M2M';

    public function handle()
    {
        $name = $this->argument('name');

        $tenant = Tenant::create(['name' => $name]);

        // Cria um token sem data de expiração
        $token = $tenant->createToken('api-key')->plainTextToken;

        $this->info("Tenant '{$name}' criado com sucesso!");
        $this->warn("Guarde esta Chave de API. Ela não será mostrada novamente:");
        $this->line($token);
    }
}

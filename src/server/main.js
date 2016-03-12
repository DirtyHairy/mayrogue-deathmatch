import bootstrap from './bootstrap';
import Server from './Server';

export function run() {
    bootstrap();

    const server = new Server();

    server.start();
}

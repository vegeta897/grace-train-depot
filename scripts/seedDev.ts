import { PrismaClient } from '@prisma/client'
import { COLORS } from 'grace-train-lib'
const prisma = new PrismaClient()

const getUserId = (number: number) => 'testuser' + `${number}`.padStart(7, '0')

async function main() {
	const userNumbers = [0, 1, 2, 3, 4]
	const users = await prisma.user.createMany({
		data: userNumbers.map((number) => ({
			id: getUserId(number),
			twitchUserId: `${1000 + number}`,
			twitchUsername: `testuser${number}`,
			twitchDisplayName: `TestUser${number}`,
		})),
	})
	console.log('created', users.count, 'users')
	const cars = await prisma.car.createMany({
		data: userNumbers.map((number) => ({
			userId: getUserId(number),
			shortId: 'test' + `${number}`.padStart(4, '0'),
			name: `Test Car ${number}`,
			bodyColor: COLORS.BASE[number * 2],
			bodyPopColor: COLORS.POP[number * 3],
			wheelColor: COLORS.POP[number * 3],
		})),
	})
	console.log('created', cars.count, 'cars')
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})

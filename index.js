const Discord = require('discord.js');

const { Intents } = require('discord.js');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_INVITES"] });
const config = require('./config.json');
const { MessageActionRow, MessageButton } = require('discord.js');

let invites = {};

const getInviteCounts = async (guild) => {
    return new Map(guild.invites.cache.map(invite => [invite.code, invite.uses]));
};

client.once('ready', async () => {
    console.log('Bot is online!');
	console.log('Code by Wick Studio , Change Mate!');
	console.log('discord.gg/Wick');

    // Load all server invites
    for (const [guildId, guild] of client.guilds.cache) {
        try {
            const currentInvites = await guild.invites.fetch();
            invites[guildId] = new Map(currentInvites.map(invite => [invite.code, invite.uses]));
            console.log(`Loaded ${currentInvites.size} invites for guild: ${guild.name}`);
        } catch (err) {
            console.log(`Failed to load invites for guild: ${guild.name}`);
            console.error(err);
        }
    }
});

client.on('inviteCreate', async invite => {
    const guildInvites = invites[invite.guild.id];
    guildInvites.set(invite.code, invite.uses);
});

client.on('inviteDelete', async invite => {
    const guildInvites = invites[invite.guild.id];
    guildInvites.delete(invite.code);
});

client.on('guildMemberAdd', async member => {
    const welcomeChannel = member.guild.channels.cache.get(config.welcomeChannelId);
    const role = member.guild.roles.cache.get(config.autoRoleId);

    
    if (role) {
        member.roles.add(role).catch(console.error);
    } else {
        console.log('Role not found');
    }

    const newInvites = await member.guild.invites.fetch();
    const usedInvite = newInvites.find(inv => {
        const prevUses = (invites[member.guild.id].get(inv.code) || 0);
        return inv.uses > prevUses;
    });

    let inviterMention = 'Unknown';
    if (usedInvite && usedInvite.inviter) {
        inviterMention = `<@${usedInvite.inviter.id}>`;
        console.log(`Member joined with invite code ${usedInvite.code}`);
    } else {
        console.log(`Member joined, but no matching invite was found.`);
    }

    
    const fullUser = await client.users.fetch(member.user.id, { force: true });

    const welcomeEmbed = new Discord.MessageEmbed()
        .setColor('#05131f') // تقدر تعدل على ال لون بس ما تخلوش Red , Green اكتب نفس ما هو موجود
	    // Ex : #2ee71f
        .setTitle('السيرفر نور بوجودك😊!') // تقدر تعدل على رسالة الترحيب
        .setDescription(`اهلا بك يا ${member}, منور سيرفرنا المتواضع😊.`) // تقدر تعدل عليها ايضا لا تحذف الmember
        .addFields(
            { name: 'Server Rules', value: '<#1164662648080707604>.', inline: true }, // هنا تخلي ايدي الروم الي انت عاوزو يروح له
            // تقدر تعدل على اسم server Rules
	    // تقدز تعدل على اسم Support Channel
	    { name: 'Support Channel', value: '<#1166772582951964702>.', inline: true } // هنا نفس الشي
        )
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp()
	.setImage("") // هنا تخلي رابط الصورة او البنر الي انت عاوزو
	.steTimestamp();
    const bannerUrl = fullUser.bannerURL({ dynamic: true, format: 'png', size: 1024 });
    if (bannerUrl) {
        welcomeEmbed.setImage(bannerUrl);
    }

    welcomeChannel.send({ embeds: [welcomeEmbed] });

    invites[member.guild.id] = new Map(newInvites.map(invite => [invite.code, invite.uses]));
});

client.login(config.botToken); // رجاءً لا تخلي توكن بوتك هنا ل تجنب مشاكل مثل الرسالة تصير رسالتين لما شخص يدخل للسيرفر اتمنى انه تخلون البروجكت بالكونفج

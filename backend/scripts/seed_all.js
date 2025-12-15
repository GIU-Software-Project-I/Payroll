/**
 * Master Seed Script - Runs all seed scripts in order
 * 
 * This script orchestrates the execution of all seed scripts in the correct order.
 * 
 * Run with: node scripts/seed_all.js
 * 
 * Seed Order:
 * 1. seed_complete_system.js - Base data (users, profiles, departments, shifts, attendance, etc.)
 * 2. seed_01_recruitment.js - Candidates, job templates, applications, interviews, offers, contracts
 * 3. seed_02_performance.js - Appraisal templates, cycles, assignments, records, disputes
 * 4. seed_03_leaves.js - Leave categories, policies, entitlements, adjustments, calendars
 * 5. seed_04_payroll.js - Allowances, pay types, company settings, signing bonuses, claims
 * 6. seed_05_organization.js - Position assignments, structure changes, qualifications, documents
 * 7. seed_06_time_offboarding.js - Schedule rules, shift types, time exceptions, terminations
 */

const { execSync } = require('child_process');
const path = require('path');

const scripts = [
    { name: 'Base System Data', file: 'seed_complete_system.js' },
    { name: 'Recruitment Data', file: 'seed_01_recruitment.js' },
    { name: 'Performance Data', file: 'seed_02_performance.js' },
    { name: 'Leaves Extended Data', file: 'seed_03_leaves.js' },
    { name: 'Payroll Extended Data', file: 'seed_04_payroll.js' },
    { name: 'Organization Data', file: 'seed_05_organization.js' },
    { name: 'Time & Offboarding Data', file: 'seed_06_time_offboarding.js' },
];

async function runAllSeeds() {
    console.log('='.repeat(60));
    console.log('       MASTER SEED SCRIPT - Populating All Collections');
    console.log('='.repeat(60));
    console.log('');
    
    const startTime = Date.now();
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        console.log(`\n[${'='.repeat(50)}]`);
        console.log(`[${i + 1}/${scripts.length}] Running: ${script.name}`);
        console.log(`[File: ${script.file}]`);
        console.log(`[${'='.repeat(50)}]\n`);
        
        try {
            const scriptPath = path.join(__dirname, script.file);
            execSync(`node "${scriptPath}"`, { 
                stdio: 'inherit',
                cwd: path.join(__dirname, '..')
            });
            successCount++;
            console.log(`\n✅ ${script.name} - COMPLETED`);
        } catch (error) {
            failCount++;
            console.error(`\n❌ ${script.name} - FAILED`);
            console.error(`Error: ${error.message}`);
            
            // Ask if should continue
            console.log('\nContinuing with next script...\n');
        }
        
        // Small delay between scripts
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('                    SEED SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Scripts: ${scripts.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Duration: ${duration} seconds`);
    console.log('='.repeat(60));
    
    if (failCount === 0) {
        console.log('\n🎉 All seeds completed successfully!\n');
    } else {
        console.log(`\n⚠️  ${failCount} seed(s) failed. Please check the errors above.\n`);
    }
    
    console.log('Collections populated:');
    console.log('─'.repeat(40));
    console.log('Base: employee_system_roles, employee_profiles, departments,');
    console.log('      positions, shifts, shiftassignments, attendancerecords,');
    console.log('      holidays, leavetypes, leavebalances, leaverequests,');
    console.log('      payroll_config, taxrules, insurancebrackets, paygrades,');
    console.log('      allowancetypes, deductiontypes, bonusconfigs, benefittypes,');
    console.log('      latenessrules, overtimerules, payrollruns, payslips');
    console.log('');
    console.log('Recruitment: candidates, jobtemplates, jobrequisitions,');
    console.log('      applications, applicationstatushistories, interviews,');
    console.log('      assessmentresults, offers, contracts, onboardings,');
    console.log('      referrals, documents');
    console.log('');
    console.log('Performance: appraisal_templates, appraisal_cycles,');
    console.log('      appraisal_assignments, appraisal_records, appraisal_disputes');
    console.log('');
    console.log('Leaves: leavecategories, leavepolicies, leaveentitlements,');
    console.log('      leaveadjustments, calendars, attachments');
    console.log('');
    console.log('Payroll: allowances, paytypes, companywidesettings, signingbonus,');
    console.log('      payrollpolicies, terminationandresignationbenefits,');
    console.log('      employeepayrolldetails, employeepenalties, employeesigningbonus,');
    console.log('      claims, disputes, refunds');
    console.log('');
    console.log('Organization: position_assignments, structure_change_requests,');
    console.log('      structure_approvals, structure_change_logs,');
    console.log('      employee_profile_change_requests, employee_qualifications,');
    console.log('      employeedocuments');
    console.log('');
    console.log('Time & Offboarding: schedulerules, shifttypes, timeexceptions,');
    console.log('      attendancecorrectionrequests, notificationlogs,');
    console.log('      terminationrequests, clearancechecklists,');
    console.log('      employeeterminationresignations');
    console.log('─'.repeat(40));
}

runAllSeeds().catch(console.error);

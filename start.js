const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const http = require('http')
const https = require('https')

const isWindows = process.platform === 'win32'

function resolveCommand(command) {
  if (!isWindows) return command
  if (command === 'npm') return 'npm.cmd'
  return command
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getListeningPids(port) {
  if (isWindows) {
    const res = await spawnCapture('netstat', ['-ano', '-p', 'tcp'])
    if (res.code !== 0) return []
    const lines = res.stdout.split(/\r?\n/)
    const pids = new Set()
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      const parts = trimmed.split(/\s+/)
      if (parts.length < 5) continue
      const proto = parts[0]
      if (proto.toUpperCase() !== 'TCP') continue
      const local = parts[1]
      const state = parts[3]
      const pid = parts[4]
      if (!local || !pid) continue
      if (!local.endsWith(`:${port}`)) continue
      if (String(state).toUpperCase() !== 'LISTENING') continue
      pids.add(Number(pid))
    }
    return Array.from(pids).filter((n) => Number.isFinite(n) && n > 0)
  }

  const lsof = await spawnCapture('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t'])
  if (lsof.code === 0) {
    return lsof.stdout
      .split(/\r?\n/)
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0)
  }
  const fuser = await spawnCapture('fuser', ['-n', 'tcp', String(port)])
  if (fuser.code === 0) {
    return fuser.stdout
      .split(/\s+/)
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0)
  }
  return []
}

async function getPidCommandLine(pid) {
  if (!pid) return ''
  if (isWindows) {
    const ps = await spawnCapture('powershell', [
      '-NoProfile',
      '-Command',
      `(Get-CimInstance Win32_Process -Filter "ProcessId=${pid}").CommandLine`
    ])
    if (ps.code === 0) return ps.stdout.trim()
    return ''
  }
  const res = await spawnCapture('ps', ['-p', String(pid), '-o', 'command='])
  if (res.code === 0) return res.stdout.trim()
  return ''
}

async function describeListeningProcesses(pids) {
  const list = []
  for (const pid of pids) {
    const cmd = await getPidCommandLine(pid)
    list.push({ pid, cmd })
  }
  return list
}

function formatProcessList(processes) {
  return processes
    .map((p) => {
      const cmd = p.cmd ? p.cmd.replace(/\s+/g, ' ').trim() : ''
      return cmd ? `PID ${p.pid}: ${cmd}` : `PID ${p.pid}`
    })
    .join('\n')
}

function looksLikeExpressCabinetBackendByCmdline({ backendDir, cmdline }) {
  if (!cmdline) return false
  const normalized = cmdline.replace(/\\/g, '/').toLowerCase()
  const backendNormalized = backendDir.replace(/\\/g, '/').toLowerCase()
  const needles = [
    'com.express.cabinet.expresscabinetapplication',
    'expresscabinetapplication',
    'express-cabinet-backend',
    'spring-boot:run',
    '/backend/',
    backendNormalized
  ]
  return needles.some((n) => normalized.includes(n))
}

async function looksLikeExpressCabinetBackendByHttp() {
  try {
    const res = await httpRequest({ method: 'GET', url: 'http://localhost:8080/api/cabinets' })
    if (res.statusCode <= 0) return false
    const contentType = String(res.headers['content-type'] || '')
    if (!contentType.toLowerCase().includes('application/json')) return false
    const bodyText = res.body.toString('utf8')
    const json = JSON.parse(bodyText)
    return typeof json?.code === 'number' && 'message' in json && 'data' in json
  } catch (e) {
    return false
  }
}

async function looksLikeExpressCabinetBackend({ backendDir, pids }) {
  const processes = await describeListeningProcesses(pids)
  if (processes.some((p) => looksLikeExpressCabinetBackendByCmdline({ backendDir, cmdline: p.cmd }))) return true
  return looksLikeExpressCabinetBackendByHttp()
}

async function stopPids(pids) {
  const unique = Array.from(new Set(pids)).filter((n) => Number.isFinite(n) && n > 0)
  if (unique.length === 0) return
  if (isWindows) {
    for (const pid of unique) {
      await spawnCapture('taskkill', ['/PID', String(pid), '/T'])
    }
    await delay(800)
    for (const pid of unique) {
      await spawnCapture('taskkill', ['/PID', String(pid), '/F', '/T'])
    }
    return
  }

  for (const pid of unique) {
    await spawnCapture('kill', ['-15', String(pid)])
  }
  await delay(1000)
  for (const pid of unique) {
    await spawnCapture('kill', ['-9', String(pid)])
  }
}

async function waitPortFree(port, timeoutMs) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const pids = await getListeningPids(port)
    if (pids.length === 0) return
    await delay(500)
  }
  throw new Error(`等待端口释放超时：${port}`)
}

function spawnCapture(command, args, options = {}) {
  return new Promise((resolve) => {
    let resolved = false
    const finish = (result) => {
      if (resolved) return
      resolved = true
      resolve(result)
    }

    let stdout = ''
    let stderr = ''
    let child
    try {
      child = spawn(command, args, {
        shell: isWindows,
        windowsHide: true,
        ...options,
        stdio: ['ignore', 'pipe', 'pipe']
      })
    } catch (e) {
      finish({ code: -1, stdout: '', stderr: e?.message || String(e) })
      return
    }
    child.stdout.on('data', (d) => {
      stdout += d.toString()
    })
    child.stderr.on('data', (d) => {
      stderr += d.toString()
    })
    child.on('error', (e) => {
      finish({ code: -1, stdout, stderr: `${stderr}${e?.message || String(e)}` })
    })
    child.on('close', (code) => finish({ code, stdout, stderr }))
  })
}

async function assertCommandWorks(command, args, name) {
  const res = await spawnCapture(command, args)
  if (res.code !== 0) {
    const details = [res.stdout, res.stderr].filter(Boolean).join('\n').trim()
    const suffix = details ? `\n\n${details}` : ''
    throw new Error(`${name}不可用：${command} ${args.join(' ')}${suffix}`)
  }
}

async function ensureDockerReady() {
  await assertCommandWorks('docker', ['--version'], 'Docker')
  await assertCommandWorks('docker', ['info'], 'Docker引擎')
}

function logLine(message) {
  process.stdout.write(`${message}\n`)
}

function logStep(title) {
  logLine(`\n[步骤] ${title}`)
}

function logOk(message) {
  logLine(`[完成] ${message}`)
}

function logWarn(message) {
  logLine(`[警告] ${message}`)
}

function logError(message) {
  process.stderr.write(`[错误] ${message}\n`)
}

async function ensureVolume(volumeName) {
  const inspect = await spawnCapture('docker', ['volume', 'inspect', volumeName])
  if (inspect.code === 0) return
  const created = await spawnCapture('docker', ['volume', 'create', volumeName])
  if (created.code !== 0) {
    throw new Error(`创建Docker volume失败：${volumeName}\n${created.stderr || created.stdout}`)
  }
}

async function getContainerRunning(containerName) {
  const res = await spawnCapture('docker', ['inspect', '-f', '{{.State.Running}}', containerName])
  if (res.code !== 0) return { exists: false, running: false }
  const running = res.stdout.trim() === 'true'
  return { exists: true, running }
}

async function ensureLocalMySqlReady() {
  const host = 'localhost'
  const port = '3306'
  const user = 'root'
  const password = 'root'
  const database = 'express_cabinet'

  logStep('检查本地 MySQL 环境')
  const version = await spawnCapture('mysql', ['--version'])
  if (version.code !== 0) {
    throw new Error('未检测到 mysql 客户端，请安装 MySQL 或使用 Docker 启动数据库。')
  }

  const resDb = await spawnCapture(
    'mysql',
    ['-h', host, '-P', port, '-u', user, `-p${password}`, '--default-character-set=utf8mb4', '-e', `SHOW DATABASES LIKE '${database}';`]
  )
  if (resDb.code !== 0) {
    throw new Error('无法连接本地 MySQL，请确认服务已启动且账号密码与 server/backend/src/main/resources/application.yml 中配置一致。')
  }

  if (!resDb.stdout.includes(database)) {
    throw new Error(
        '本地 MySQL 已就绪，但尚未初始化 express_cabinet 数据库。\n' +
        '请在项目根目录执行：\n' +
        'mysql -uroot -p --default-character-set=utf8mb4 < server/database/init.sql'
    )
  }

  logOk('检测到本地 MySQL 已存在 express_cabinet 数据库，将直接使用。')
  return { containerName: 'local-mysql', mysqlPort: port, rootPassword: password }
}

async function ensureMySqlContainer({ rootDir }) {
  const containerName = 'express-mysql'
  const volumeName = 'express-mysql-data'
  const rootPassword = 'root'
  const mysqlPort = '3306'

  const initSqlPath = path.resolve(rootDir, 'server', 'database', 'init.sql')
  if (!fs.existsSync(initSqlPath)) {
    throw new Error(`未找到初始化脚本：${initSqlPath}`)
  }
  const dockerHostPath = initSqlPath.replace(/\\/g, '/')

  logStep('检查Docker环境')
  try {
    await ensureDockerReady()
    logOk('Docker环境正常')
  } catch (e) {
    logWarn('未检测到可用的 Docker，尝试使用本地已安装的 MySQL。')
    return ensureLocalMySqlReady()
  }

  logStep('准备MySQL Docker数据卷')
  await ensureVolume(volumeName)
  logOk(`数据卷就绪：${volumeName}`)

  logStep('启动/创建MySQL容器（express-mysql）')
  const state = await getContainerRunning(containerName)
  if (state.exists) {
    if (!state.running) {
      const started = await spawnCapture('docker', ['start', containerName])
      if (started.code !== 0) {
        throw new Error(`启动MySQL容器失败：${containerName}\n${started.stderr || started.stdout}`)
      }
    }
  } else {
    const runArgs = [
      'run',
      '--name',
      containerName,
      '-e',
      `MYSQL_ROOT_PASSWORD=${rootPassword}`,
      '-p',
      `${mysqlPort}:3306`,
      '-v',
      `${volumeName}:/var/lib/mysql`,
      '-v',
      `${dockerHostPath}:/docker-entrypoint-initdb.d/init.sql:ro`,
      '-d',
      'mysql:8.0'
    ]
    const created = await spawnCapture('docker', runArgs)
    if (created.code !== 0) {
      throw new Error(`创建MySQL容器失败（可能是3306端口被占用）：\n${created.stderr || created.stdout}`)
    }
  }
  logOk(`MySQL容器已启动：${containerName}`)

  logStep('等待MySQL就绪（最多120秒）')
  const deadline = Date.now() + 120_000
  while (Date.now() < deadline) {
    const ping = await spawnCapture('docker', [
      'exec',
      containerName,
      'mysqladmin',
      'ping',
      '-uroot',
      `-p${rootPassword}`,
      '--silent'
    ])
    if (ping.code === 0) return { containerName, mysqlPort, rootPassword }
    await delay(2000)
  }

  throw new Error('MySQL启动超时（超过120秒），请检查容器日志：docker logs express-mysql')
}

function httpRequest({ method, url, headers = {}, body }) {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const lib = u.protocol === 'https:' ? https : http
    const req = lib.request(
      {
        method,
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        headers
      },
      (res) => {
        const chunks = []
        res.on('data', (d) => chunks.push(d))
        res.on('end', () => {
          const buf = Buffer.concat(chunks)
          resolve({ statusCode: res.statusCode || 0, headers: res.headers, body: buf })
        })
      }
    )
    req.setTimeout(5000, () => {
      req.destroy(new Error('请求超时'))
    })
    req.on('error', reject)
    if (body) req.write(body)
    req.end()
  })
}

async function waitHttp(url, { timeoutMs, acceptHtml = false }) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await httpRequest({
        method: 'GET',
        url,
        headers: acceptHtml ? { Accept: 'text/html' } : {}
      })
      if (res.statusCode > 0) return res
    } catch (e) {}
    await delay(1000)
  }
  throw new Error(`等待服务超时：${url}`)
}

async function smokeTestBackend() {
  logStep('冒烟测试：后端登录并访问受保护接口')
  const loginRes = await httpRequest({
    method: 'POST',
    url: 'http://localhost:8080/api/auth/login',
    headers: { 'Content-Type': 'application/json' },
    body: Buffer.from(JSON.stringify({ username: 'admin', password: '123456' }))
  })
  const loginBody = JSON.parse(loginRes.body.toString('utf8'))
  const token = loginBody?.data?.token
  if (!token) {
    throw new Error(`后端登录失败：${loginRes.statusCode}\n${JSON.stringify(loginBody)}`)
  }

  const cabinetsRes = await httpRequest({
    method: 'GET',
    url: 'http://localhost:8080/api/cabinets',
    headers: { Authorization: `Bearer ${token}` }
  })
  const cabinetsBody = JSON.parse(cabinetsRes.body.toString('utf8'))
  const count = Array.isArray(cabinetsBody?.data) ? cabinetsBody.data.length : 0
  if (cabinetsBody?.code !== 200) {
    throw new Error(`后端接口校验失败：${cabinetsRes.statusCode}\n${JSON.stringify(cabinetsBody)}`)
  }
  logOk(`后端接口正常：/api/cabinets 返回 ${count} 条数据`)
  return { cabinetsCount: count }
}

function createPrefixedLineWriter(prefix) {
  let buf = ''
  return (chunk) => {
    buf += chunk.toString()
    while (true) {
      const idx = buf.indexOf('\n')
      if (idx < 0) break
      const line = buf.slice(0, idx).replace(/\r$/, '')
      buf = buf.slice(idx + 1)
      if (line.trim().length === 0) continue
      process.stdout.write(`${prefix}${line}\n`)
    }
  }
}

function spawnLongRunning(command, args, options, { prefix }) {
  let child
  try {
    child = spawn(command, args, {
      shell: isWindows,
      windowsHide: true,
      ...options,
      stdio: ['ignore', 'pipe', 'pipe']
    })
  } catch (e) {
    throw new Error(`${command} 启动失败：${e?.message || String(e)}`)
  }

  const writeOut = createPrefixedLineWriter(prefix)
  const writeErr = createPrefixedLineWriter(prefix)
  child.stdout.on('data', writeOut)
  child.stderr.on('data', writeErr)

  child.on('error', (err) => {
    logError(`${command} 运行出错：${err.message}`)
  })
  return child
}

async function ensureFrontendDeps({ npm, frontendDir }) {
  const nodeModules = path.resolve(frontendDir, 'node_modules')
  if (fs.existsSync(nodeModules)) return
  logStep('安装前端依赖（npm install）')
  const res = await spawnCapture(npm, ['install'], { cwd: frontendDir })
  if (res.code !== 0) {
    throw new Error(`前端依赖安装失败：\n${res.stderr || res.stdout}`)
  }
  logOk('前端依赖安装完成')
}

function resolveBackendRunCommand({ backendDir }) {
  if (isWindows) {
    const wrapperCmd = path.resolve(backendDir, 'mvnw.cmd')
    if (fs.existsSync(wrapperCmd)) {
      return { command: wrapperCmd, args: ['spring-boot:run'] }
    }
    throw new Error(`未找到Maven Wrapper：${wrapperCmd}`)
  }

  const wrapperSh = path.resolve(backendDir, 'mvnw')
  if (fs.existsSync(wrapperSh)) {
    return { command: 'sh', args: [wrapperSh, 'spring-boot:run'] }
  }
  return { command: 'mvn', args: ['spring-boot:run'] }
}

async function main() {
  const rootDir = path.resolve(__dirname)
  const backendDir = path.resolve(rootDir, 'server', 'backend')
  const frontendDir = path.resolve(rootDir, 'web')
  const npm = resolveCommand('npm')
  const backendRun = resolveBackendRunCommand({ backendDir })

  if (!fs.existsSync(path.join(backendDir, 'pom.xml'))) {
    throw new Error(`未找到后端目录：${backendDir}`)
  }
  if (!fs.existsSync(path.join(frontendDir, 'package.json'))) {
    throw new Error(`未找到前端目录：${frontendDir}`)
  }

  await assertCommandWorks('node', ['--version'], 'Node.js')
  await assertCommandWorks(npm, ['--version'], 'npm')
  await ensureFrontendDeps({ npm, frontendDir })

  const mysql = await ensureMySqlContainer({ rootDir })
  logOk(`MySQL已就绪：容器=${mysql.containerName} 端口=${mysql.mysqlPort}`)

  logStep('检查后端是否已运行（8080端口）')
  const existingBackendPids = await getListeningPids(8080)
  if (existingBackendPids.length > 0) {
    const looksLikeOurBackend = await looksLikeExpressCabinetBackend({ backendDir, pids: existingBackendPids })
    if (!looksLikeOurBackend) {
      const processes = await describeListeningProcesses(existingBackendPids)
      const details = formatProcessList(processes)
      if (process.env.EXPRESS_CABINET_FORCE_KILL_8080 === '1') {
        logWarn('检测到8080端口被占用，但已开启强制释放端口，将尝试结束占用进程')
        if (details) logWarn(`占用详情：\n${details}`)
        await stopPids(existingBackendPids)
        await waitPortFree(8080, 20_000)
        logOk('已强制释放8080端口')
      } else {
        const extra = details
          ? `\n\n占用详情：\n${details}\n\n如需强制结束占用进程后继续启动，可临时设置环境变量：\nEXPRESS_CABINET_FORCE_KILL_8080=1`
          : '\n\n如需强制结束占用进程后继续启动，可临时设置环境变量：\nEXPRESS_CABINET_FORCE_KILL_8080=1'
        throw new Error(`检测到8080端口已被其他程序占用，无法启动后端（请先关闭占用8080的程序）${extra}`)
      }
    }
    if (looksLikeOurBackend) {
      logWarn(`检测到后端已在运行（PID: ${existingBackendPids.join(', ')}），将自动停止并重新启动`)
      await stopPids(existingBackendPids)
      await waitPortFree(8080, 20_000)
      logOk('已停止旧后端进程')
    }
  } else {
    logOk('后端未运行')
  }

  logStep('启动后端（Spring Boot）')
  const backend = spawnLongRunning(backendRun.command, backendRun.args, { cwd: backendDir }, { prefix: '[backend] ' })
  logStep('启动前端（Vite）')
  const frontend = spawnLongRunning(npm, ['run', 'dev'], { cwd: frontendDir }, { prefix: '[frontend] ' })

  const shutdown = async () => {
    const children = [frontend, backend].filter((c) => c && !c.killed)
    for (const c of children) {
      try {
        c.kill('SIGINT')
      } catch (e) {
        try {
          c.kill('SIGTERM')
        } catch (e2) {}
      }
    }
    await delay(1500)
    for (const c of children) {
      try {
        c.kill('SIGKILL')
      } catch (e) {}
    }
  }

  let exiting = false
  const exitWith = async (code) => {
    if (exiting) return
    exiting = true
    await shutdown()
    process.exit(code)
  }

  process.on('SIGINT', () => exitWith(130))
  process.on('SIGTERM', () => exitWith(143))

  backend.on('exit', (code) => exitWith(typeof code === 'number' ? code : 1))
  frontend.on('exit', (code) => exitWith(typeof code === 'number' ? code : 1))

  logStep('等待后端与前端服务就绪')
  const backendUrl = 'http://localhost:8080/api'
  const frontendUrl = 'http://localhost:3000/'
  await waitHttp(backendUrl, { timeoutMs: 120_000 })
  await waitHttp(frontendUrl, { timeoutMs: 120_000, acceptHtml: true })
  const backendPort = Number(new URL(backendUrl).port || 80)
  const frontendPort = Number(new URL(frontendUrl).port || 80)
  logOk('服务已就绪')

  const smoke = await smokeTestBackend()
  logOk(`冒烟测试通过：/api/cabinets 返回 ${smoke.cabinetsCount} 条数据`)
  logLine('\n[访问地址]')
  logLine(`- MySQL:      127.0.0.1:${mysql.mysqlPort}  (容器: ${mysql.containerName})`)
  logLine(`- Backend:    127.0.0.1:${backendPort}  地址: ${backendUrl}`)
  logLine(`- Frontend:   127.0.0.1:${frontendPort}  地址: ${frontendUrl}`)
  logLine('\n服务正在运行，按 Ctrl+C 退出并自动停止前后端进程。')
  await new Promise(() => {})
}

main().catch((err) => {
  const msg = err?.message || String(err)
  logError(msg)
  if (msg.includes('3306')) {
    logWarn('3306端口可能被占用：请停止本机MySQL或其它占用3306的容器/服务后重试')
  }
  process.exit(1)
})
